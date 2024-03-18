import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {ApiError} from '../../api-error';
import {Request, Response} from 'express';
import {formatZodError} from '../../validators';
import {mentorInvitationResponse} from '../../../../storage/mentorInvitations';
import {createNotification} from '../../../../storage/notifications';

const bodySchema = z.object({
	themeId: z.number(),
	action: z.union([
		z.literal('accept'),
		z.literal('reject')
	])
});

export const mentorResponseHandler = asyncMiddleware(async (req: Request, res: Response) => {
    const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	if (req.currentUser.role !== 'mentor') {
		throw new ApiError('NOT_ENOUGH_RIGHTS', 403, 'Not enough rights to accept join requests');
	}

	let inviterUid = await mentorInvitationResponse({...body, mentorUid: req.currentUser.uid});

	if (!inviterUid) {
		throw new Error('Failed to update invitation');
	}

	const notificationResult = await createNotification({
		type: 'MENTOR_RESPONSE',
		userUid: inviterUid,
		attributes: {
			themeId: body.themeId,
			mentorName: `${req.currentUser.name} ${req.currentUser.surname}`,
			mentorUid: req.currentUser.uid,
			status: body.action === 'accept' ? 'accepted' : 'rejected'
		}
	})

	if (!notificationResult) {
		throw new Error('Failed to create notification');
	}

    res.status(200).json({status: 'OK'});
});