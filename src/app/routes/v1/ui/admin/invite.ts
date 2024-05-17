import asyncMiddleware from 'middleware-async';
import {Request, Response} from 'express';
import z from 'zod';
import {ApiError} from '../../api-error';
import {formatZodError} from '../../validators';
import {passportProvider} from '../../../../providers/passport';
import {createUserRecord, getUserDetails} from '../../../../storage/user';

const bodySchema = z.object({
	email: z.string().email(),
    name: z.string(),
    surname: z.string(),
	patronymic: z.string(),
	post: z.string().optional().nullable(),
	groupName: z.string().optional().nullable(),
    role: z.union([
		z.literal('default'),
		z.literal('mentor'),
		z.literal('moderator')
	]),
    linkToRegisterForm: z.string().url(),
	senderOptions: z.object({
        email: z.string().email(),
        emailSecret: z.string(),
        templateUid: z.string().uuid()
    })
});

export const inviteHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	console.log(JSON.stringify(body))

	const moderDetails = await getUserDetails(req.currentUser.uid);

	if (!moderDetails) {
		throw new Error('Failed to get organization');
	}

	const data = await passportProvider.registrationInvite({
		...body,
		accessToken: req.headers.authorization ? req.headers.authorization.split(' ')[1] : '',
		organizationName: moderDetails.organization.shortName
	})

	if (!data.ok) {
		throw new Error('Failed to create passport');
	}

	const userRecordResult = await createUserRecord(data.value.uid, {
		groupName: body.groupName ?? null,
		organizationId: moderDetails.organization.id,
		post: body.post ?? null
	});

	if (!userRecordResult) {
		throw new Error('Failed to create user record');
	}

    res.status(200).json({
        status: 'OK'
    });
});