import {Method, Response} from 'got';
import {config} from '../config';
import {httpClient} from '../lib/httpClient';
import {AsyncResult, User} from '../types';

const passportHttpClient = httpClient;

type PassportErrorCode = 
	| 'UNAUTHORIZED'
	| 'BAD_REQUEST'
	| 'NO_INVITATION_FOR_USER'
	| 'ALREADY_EXISTS'
	| 'INVALID_SECRET'
	| 'NOT_FOUND'
	| 'INVALID_PASSWORD'
	| 'NEED_PASSWORD_RESET'
	| 'INVALID_TOKEN'
	| 'TOKEN_EXPIRED'
	| 'NOT_ENOUGH_RIGHTS';

type UserInfoResponse = {
	status: 'OK',
	data: User
}

export class PassportError extends Error {
	code: PassportErrorCode;
	constructor(code: PassportErrorCode, message: string) {
		super(message);
		this.code = code;
	}
}

class PassportProvider {
	private _baseUrl: string;
	constructor() {
		this._baseUrl = config['passport.baseUrl'];
	}

	private async _request<T extends object>(args: {
		method: Method,
		path: string;
		query?: Record<string, string>,
		body?: Record<string, any>
	}): AsyncResult<T, PassportError> {
		let response: Response<T>;
		const url = new URL(args.path, this._baseUrl);
		try {
			response = await passportHttpClient<T>(url, {
				method: args.method,
				searchParams: args.query,
				json: args.body,
				responseType: 'json'
			});
		} catch (error) {
			throw new Error(`Unexpected passport error ${JSON.stringify(error)}`);
		}

		if (response.statusCode !== 200) {
			const body = response.body as any;
			return {
				ok: false,
				error: new PassportError(body.code, body.message)
			}
		}

		return {
			ok: true,
			value: response.body
		}
	}

	async userInfo(userId: string): AsyncResult<User, PassportError> {
		const response = await this._request<UserInfoResponse>({
			method: 'GET',
			query: {userId},
			path: 'user_info'
		});

		if (!response.ok) {
			return response;
		}

		return {
			ok: true,
			value: response.value.data
		}
	}
}

export const passportProvider = new PassportProvider();