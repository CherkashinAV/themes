import crypto from 'crypto-js';
import {config} from '../config';
import {logger} from './logger';

export class CryptoManager {
	private privateKey: string;

	constructor() {
		this.privateKey = config['privateKey'];
	}

	encodeData(data: string) {
		let encoded: string;
		try {
			encoded = crypto.AES.encrypt(data, this.privateKey).toString(); 
		} catch (error) {
			logger.error(error)
			return {
				ok: false,
				error: error
			}
		}

		return {
			ok: true,
			value: encoded
		}
	}

	decodeData(encoded: string) {
		let decoded: string;
		try {
			decoded = crypto.AES.decrypt(encoded, this.privateKey).toString(crypto.enc.Utf8);; 
		} catch (error) {
			logger.error(error)
			return {
				ok: false,
				error: error
			}
		}

		return {
			ok: true,
			value: decoded
		}
	}

	validate(current: string, stored: string) {
		const decodeResult = this.decodeData(stored);

		if (!decodeResult.ok) {
			return false;
		}

		return (decodeResult.value === current);
	}
}

export const cryptoManager = new CryptoManager();