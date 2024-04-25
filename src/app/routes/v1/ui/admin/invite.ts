import asyncMiddleware from 'middleware-async';
import {Request, Response} from 'express';
import {notificationLook} from '../../../../storage/notifications';
import z from 'zod';
import {ApiError} from '../../api-error';
import {formatZodError} from '../../validators';
import {passportProvider} from '../../../../providers/passport';
import {createUserRecord, getUserDetails} from '../../../../storage/user';
import {logger} from '../../../../lib/logger';

const bodySchema = z.object({
	email: z.string().email(),
    name: z.string(),
    surname: z.string(),
    role: z.union([
		z.literal('default'),
		z.literal('mentor'),
		z.literal('moderator')
	]),
    linkToRegisterForm: z.string().url()
});

export const inviteHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	const data = await passportProvider.registrationInvite({
		...body,
		accessToken: req.headers.authorization ? req.headers.authorization.split(' ')[1] : ''
	})

	if (!data.ok) {
		throw new Error('Failed to create passport');
	}

	const mentorDetails = await getUserDetails(req.currentUser.uid);

	if (!mentorDetails) {
		throw new Error('Failed to get organization');
	}

	const userRecordResult = await createUserRecord(data.value.uid, mentorDetails.organization.id);

	if (!userRecordResult) {
		throw new Error('Failed to create user record');
	}

    res.status(200).json({
        status: 'OK'
    });
});