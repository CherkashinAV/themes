import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {ApiError} from '../../api-error';
import {Request, Response} from 'express';
import {formatZodError} from '../../validators';
import {getUserIdByUid} from '../../../../storage/user';
import {deleteJoinRequest} from '../../../../storage/joinRequests';

const bodySchema = z.object({
	groupId: z.number(),
	userUid: z.string().uuid()
});

export const deleteRequestHandler = asyncMiddleware(async (req: Request, res: Response) => {
    const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	const userId = await getUserIdByUid(body.userUid);

	const deleteResult = await deleteJoinRequest(body.groupId, userId);

	if (!deleteResult) {
		throw new Error('Failed to delete join request');
	}

    res.status(200).json({status: 'OK'});
});