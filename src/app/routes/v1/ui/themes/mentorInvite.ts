import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {ApiError} from '../../api-error';
import {Request, Response} from 'express';
import {formatZodError} from '../../validators';
import {inviteMentor} from '../../../../storage/mentorInvitations';
import {createNotification} from '../../../../storage/notifications';

const bodySchema = z.object({
    themeId: z.number(),
	mentorUid: z.string().uuid()
});

export const mentorInviteHandler = asyncMiddleware(async (req: Request, res: Response) => {
    const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

    const invitationId = await inviteMentor({...body, inviter: req.currentUser.uid});

	if (!invitationId) {
		throw new Error('Failed to invite mentor');
	}

    const notificationResult = await createNotification({
        userUid: body.mentorUid,
        type: 'INVITE_MENTOR',
        attributes: {
            inviterUid: req.currentUser.uid,
            invitationId,
            inviterName: `${req.currentUser.name} ${req.currentUser.surname}`,
            themeId: body.themeId
        }
    });

    if (!notificationResult) {
        throw new Error('Failed to create notification');
    }

    res.status(200).json({status: 'OK'});
});