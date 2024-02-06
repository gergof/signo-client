# signo-client

[![NPM Version](https://img.shields.io/npm/v/signo-client)](https://www.npmjs.com/package/signo-client)
![NPM Type Definitions](https://img.shields.io/npm/types/signo-client)
[![Build Status](https://ci.systest.eu/api/badges/gergof/signo-client/status.svg)](https://ci.systest.eu/gergof/signo-client)
[![GitHub License](https://img.shields.io/github/license/gergof/signo-client)](https://github.com/gergof/signo-client/blob/master/LICENSE)

Client to send signing requests to signo server.

### Library usage

You can use this package as a library by importing it. The library is bundled as an [ES Module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

```ts
import fsp from 'fs/promises';
import SignoClient from 'signo-client';

const client = new SignoClient({
	server: 'https://signo.example.com', // the address of the signo server
	signee: 13, // the ID of the signee
	secret: '8fE1+NqqVG...', // the shared secret of the signee
	engine: 3 // the ID of the engine to use for signing
});

const toSign = await fsp.readFile('some-file.txt');

const signature = await client.sign();

await fsp.writeFile('some-file.tst.sig', signature);
```

### CLI usage

You can use this package through CLI as well:
```
Usage: signo-client [options] <file>

Client to send signing requests to signo server

Options:
  -S, --server <server>  endpoint of signo server (default: "https://localhost:3000/")
  -c, --client <signee>  ID of signee
  -s, --secret <secret>  shared secret of signee
  -e, --engine <engine>  ID of engine to use for signing
  -o, --output <output>  save signature to file instead of outputting it as hex
  --unsafe               accept any https certificate
  -h, --help             display help for command
```

### Learn more

[Signo](https://github.com/gergof/signo) is a managed signing solution that can be used to share a physical PKCS#11 security token through the internet.
