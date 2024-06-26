import asyncMiddleware from 'middleware-async';
import {Response, Request, NextFunction} from 'express';
import {PassportError, passportProvider} from '../providers/passport';

export const passportMiddleware = asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	const userId = req.headers['x-userid'] as string;
	if (!userId) {
		throw new PassportError('UNAUTHORIZED', 'Credentials is invalid');
	}
	const userInfoResponse = await passportProvider.userInfo(userId);

	if (!userInfoResponse.ok) {
		throw new Error('User info request failed');
	}

	req.currentUser = userInfoResponse.value;

	next()
});