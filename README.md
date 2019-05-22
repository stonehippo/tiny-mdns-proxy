# tiny-mdns-proxy

A small, simple DNS server for proxying mDNS requests for Raspbian on Raspberry Pi.

## How it works

tiny-mdns-proxy uses Node.js to implement a very simple DNS server using ipv4 UDP socket. The server will accept standard DNS name queries, then use the Node.js `dns.lookup` library method to utilize the underlying operating system name resolvers. Raspbian Stretch is configured to include the Avahi minimal mdns4 resolver (see `nssswitch.conf`). This means that the operating system will typically resolve local mDNS requests.

I have tested this on a Raspberry Pi running Raspbian Stretch.

## Dependencies

- [Node.js](https://nodejs.com)
- [dns-packet](https://github.com/mafintosh/dns-packet)

Install Node.js, then run:

```sh
npm install
```

## Running

To do

## License

This code is copyright (c) 2019 George White, and is available via the MIT License. See LICENSE for details
