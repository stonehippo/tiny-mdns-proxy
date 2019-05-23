# tiny-mdns-proxy

A small, simple DNS server for proxying mDNS requests for Raspbian on Raspberry Pi.

## How it works

tiny-mdns-proxy uses Node.js to implement a very simple DNS server using ipv4 UDP socket. The server will accept standard DNS name queries, then use the Node.js `dns.lookup` library method to utilize the underlying operating system name resolvers. Raspbian Stretch is configured to include the Avahi minimal mdns4 resolver (see `nssswitch.conf`). This means that the operating system will typically resolve local mDNS requests.

I have tested this on a Raspberry Pi running Raspbian Stretch.

## Dependencies

- [Node.js](https://nodejs.org)
- [dns-packet](https://github.com/mafintosh/dns-packet)

Install Node.js, then run:

```sh
npm install
```

## Running

It's possible to run `tiny-mdns-proxy` from the command line. You can do this with:

```sh
sudo node index.js
```

This isn't ideal, since it's bound to the current shell. I use [PM2](https://pm2.io) to daemonize the script and set up a service hook at boot.

```sh
sudo npm i -g pm2
sudo pm2 start --name tiny-mdns-proxy index.js
sudo pm2 startup --service-name tiny-mdns-proxy 
``` 

This will set up the app as a service, then create a startup script. You need to use `sudo`, because the script binds to port 53 to provide DNS services.

## License

This code is copyright (c) 2019 George White, and is available via the MIT License. See LICENSE for details
