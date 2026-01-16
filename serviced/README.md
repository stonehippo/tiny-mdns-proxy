# systemd service configurations

To set up the proxy as a service on a Linux system, I recommend using systemd. I have provided two templates for such a service, one for is you use an installed version of the deno runtime, and another if you have compiled a standlone executable version of the app.

You can also modify these templates fairly easily for use with bun, if that's your runtime of choice. In fact, this method for running an app came from [the bun documentation](https://bun.com/guides/ecosystem/systemd).
