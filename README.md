# tiny-mdns-proxy

A small, simple DNS server for proxying mDNS requests for Raspberry Pi OS on Raspberry Pi. Useful if you want to use Bonjour/ZeroConf/mDNS over a VPN that does not support multicast, such as Wireguard.

## How it works

tiny-mdns-proxy uses Node.js to implement a very simple DNS server using ipv4 UDP socket. The server will accept standard DNS name queries, then use the Node.js `dns.lookup` library method to utilize the underlying operating system name resolvers. Raspberry Pi OS is configured to include the Avahi minimal mdns4 resolver (see `nssswitch.conf`). This means that the operating system will typically resolve local mDNS requests. We can take advantage of this by setting up a custom Top Level Domain, which gets translated to mDNS (.local) for lookups.

I have tested this on a Raspberry Pi running Raspbian versions Stretch, Buster, and Bookworm as well as Ubuntu on various platforms, including WSL, and MacOS.

As of version 0.2.0, this code *should* also work with other runtimes, like [Deno](https://deno.com) or [Bun](https://bun.sh/). I have tested with Bun 1.1 and Deno 2.4.3 things work as expected.

## Dependencies

- [Node.js](https://nodejs.org) or another Javacript runtime, such as deno or bun.
- [dns-packet](https://github.com/mafintosh/dns-packet)

Install Node.js. [There a few ways to do this on Raspberry Pi OS](https://gist.github.com/stonehippo/f4ef8446226101e8bed3e07a58ea512a).

If you are using Node.js run:

```sh
git checkout https://github.com/stonehippo/tiny-mdns-proxy
cd tiny-mdns-proxy
npm install
```

## Running with Node.js

It's possible to run `tiny-mdns-proxy` from the command line. You can do this with:

```sh
sudo node index.mjs
```

This isn't ideal, since it's bound to the current shell. I use [PM2](https://pm2.io) to daemonize the script and set up a service hook at boot.

```sh
sudo npm i -g pm2
sudo pm2 start --name tiny-mdns-proxy index.mjs
sudo pm2 startup --service-name tiny-mdns-proxy 
``` 

This will set up the app as a service, then create a startup script. You need to use `sudo`, because the script binds to port 53 to provide DNS services.

## Running with deno

I have recently moved from Node.js to deno for the runtime for this service, because it's a bit easier to manage on the Raspberry Pi that I use to host it. This has also let me move from using PM2 to the standard `systemd` on Raspberry OS.

I have included a [`systemd` definition for tiny-mdns proxy here](serviced/tiny-mdns.service). This file should be placed in `/lib/systemd/system`. I recommend this setup, as it's simpler and relies on standard system service managmenent tools. See [the template README](./serviced/README.md) for details.

If you just want to run the proxy directly, this will work:

```sh
cd tiny-mdns-proxy
deno install
deno index.mjs
```

This is part of why I moved to deno; less fiddling around with npm!

You might get an EACCES error. This is because you're running as a non-root user. One fix for this is allow deno to bind to standard service ports:

```sh
sudo setcap CAP_NET_BIND_SERVICE=+eip ~/.deno/bin/deno
```

After this, the app should run just fine.

### Building a standalone executable with deno

deno can compile standalone executables, which removes the need for installing the  runtime seperately (it's bundled into the app). deno also supports cross-compiling, which makes building distributable versions simple.

First, you'll want to compile the app. I typically do something like this for my target Raspberry Pi:

```
deno compile --no-check --target aarch64-unknown-linux-gnu --allow-net -o mdns-proxy index.mjs
```

This creates an arm64-compatible binary for Linux, which I copy to my home directory. From there, I set up the systemd service (use the standalone template).

If you do this, you'll still want to fix giving the app access to bind to a standard service port:

```sh
sudo setcap CAP_NET_BIND_SERVICE=+eip ~/mdns-proxy
```

## Exploring Other Implementations

I built this using Node.js, but it could have been done with other languages. For example, in Ruby the native Socket (which provides `getaddrinfo`, which uses the underlying OS and can therefore resolve mDNS if the system is set up to do so) and the [net-dns](https://github.com/bluemonk/net-dns) gem for handling the DNS nameserver and packet stuff. Similarly, Python's Socket library, plus something like [dnspython](https://pypi.org/project/dnspython/) would have worked, too.

## License

This code is copyright (c) 2019-2024 George White, and is available via the MIT License. See LICENSE for details
