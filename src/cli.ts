/* eslint-disable no-console */
import fsp from 'fs/promises';
import path from 'path';

import { Command, InvalidArgumentError } from 'commander';

import SignoClient from './SignoClient.js';

const validateInt = (value: any) => {
	const parsed = parseInt(value);

	if (isNaN(parsed)) {
		throw new InvalidArgumentError('Not a number');
	}

	return parsed;
};

const main = () => {
	const program = new Command();
	program
		.name('signo-client')
		.description('Client to send signing requests to signo server')
		.option(
			'-S, --server <server>',
			'endpoint of signo server',
			'https://localhost:3000/'
		)
		.requiredOption('-c, --client <signee>', 'ID of signee', validateInt)
		.requiredOption('-s, --secret <secret>', 'shared secret of signee')
		.requiredOption(
			'-e, --engine <engine>',
			'ID of engine to use for signing',
			validateInt
		)
		.option(
			'-o, --output <output>',
			'save signature to file instead of outputting it as hex'
		)
		.option('--unsafe', 'accept any https certificate')
		.arguments('<file>')
		.action(async (file, options) => {
			console.log(`Signing file using Signo server on ${options.server}`);

			if (options.unsafe) {
				console.log('! WARNING !');
				console.log('Accepting any unsafe certificate');
				process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
			}

			console.log('- Reading file');
			const data = await fsp.readFile(path.resolve(file));

			console.log('- Creating API client');
			const client = new SignoClient({
				server: options.server,
				signee: options.client,
				secret: options.secret,
				engine: options.engine
			});

			console.log('- Sending signing request');
			const signed = await client.sign(data);

			if (options.output) {
				await fsp.writeFile(path.resolve(options.output), signed);
			} else {
				console.log('Signature (in hex):');
				console.log(signed.toString('hex'));
			}
		});

	program.parse();
};

main();
