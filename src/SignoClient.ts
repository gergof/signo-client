import crypto from 'crypto';
import { Blob } from 'node:buffer';
import { Readable } from 'stream';

import hmac, { HmacKey } from '@opsvent/hmac';
import { FormDataEncoder } from 'form-data-encoder';
import { FormData, File } from 'formdata-node';
import fetch from 'node-fetch';

export interface SignoClientOptions {
	server: string;
	signee: number;
	secret: string;
	engine: number;
}

class SignoClient {
	private target: string;
	private endpoint: URL;
	private hmacKey: HmacKey;

	constructor(options: SignoClientOptions) {
		this.target = `/api/sign/${options.engine}`;
		this.endpoint = new URL(this.target, options.server);
		this.hmacKey = {
			id: options.signee.toString(),
			key: options.secret
		};
	}

	private getHmac(hash: string) {
		return hmac.sign(
			{
				method: 'POST',
				url: this.target,
				body: hash
			},
			this.hmacKey
		);
	}

	public async sign(contents: Buffer): Promise<Buffer> {
		// calculate hash of the file
		const hash = crypto
			.createHash('sha3-512')
			.update(contents)
			.digest('hex');

		// construct request body
		const formData = new FormData();
		formData.set(
			'file',
			new File([new Blob([contents])], 'file', {
				type: 'application/octet-stream'
			})
		);

		const encoder = new FormDataEncoder(formData);

		// send the request itself
		const resp = await fetch(this.endpoint.href, {
			method: 'POST',
			headers: {
				...encoder.headers,
				Authorization: this.getHmac(hash)
			},
			body: Readable.from(encoder.encode())
		});

		if (resp.status != 200 || !resp.body) {
			throw new Error(`Failed to sign contents: ${resp.statusText}`);
		}

		return Buffer.from(await resp.arrayBuffer());
	}
}

export default SignoClient;
