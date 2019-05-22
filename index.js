/*
	tiny-mdns-proxy
	A small, simple DNS server for proxying mDNS requests for Raspbian on Raspberry Pi.

	Copyright (c) 2019 George White <stonehippo@gmail.com>
	
	Released under the MIT license, See LICENSE for details.
*/

const dns = require('dns')
const dgram = require('dgram')
const util = require('util')
const dnsPacket = require('dns-packet')

// define the domain to proxy .local mDNS addresses to
const tld = /\.hippo$/

const lookupOptions = {
	family: 4
}
const dnsLookup = util.promisify(dns.lookup)

// attempt to resolve a give name query with the system resolvers (NSS)
const lookup = name => dnsLookup(name, lookupOptions)

const emptyResponse =  id => dnsPacket.encode({
	type: 'response',
	id: id,
	class: 'IN',
	questions: [],
	answers: [],
	additionals: [],
	authorities: []
})

// package a simple mDNS response into a valid DNS response
const package = (name, address, id) =>  ({
	type: 'response',
	id: id,
	class: 'IN',
	questions: [],
	answers: [{
		type: 'A',
		name: name,
		data: address
	}],
	additionals: [],
	authorities: []
})

// bind to a datagram socket to listen for incoming DNS questions
const server = dgram.createSocket('udp4')
server.on('message', (message, requestInfo) => {
	const decoded = dnsPacket.decode(message)
	const { address, port } = requestInfo
	console.log(decoded)
	decoded.questions.forEach(question => {
		const name = tld.match(question.name) ? question.name.replace(tld, '.local') : question.name
		lookup(name)
			.then(result => {
				const packaged = package(question.name, result.address, decoded.id)
				console.log(packaged)
				const response = dnsPacket.encode(packaged)
				server.send(response, 0, response.length, port, address)
			}, error => {
				const response = emptyResponse(decoded.id)
				server.send(response, 0, response.length, port, address)
			})
	})
})
server.bind('53')


