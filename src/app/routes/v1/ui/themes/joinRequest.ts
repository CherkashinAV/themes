import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {ApiError} from '../../api-error';
import {Request, Response} from 'express';
import {formatZodError} from '../../validators';
import {getUserInfo} from '../../../../integration/user';
import {createEmptyGroup} from '../../../../storage/group';
import {createTheme} from '../../../../storage/themes';
import {createJoinRequest} from '../../../../storage/joinRequests';
import {getUserIdByUid} from '../../../../storage/user';

const bodySchema = z.object({
	themeId: z.number()
});

export const joinRequestHandler = asyncMiddleware(async (req: Request, res: Response) => {
    const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	const userId = await getUserIdByUid(req.currentUser.uid);

	const creationResult = await createJoinRequest(body.themeId, userId);

	if (!creationResult) {
		throw new Error('Failed to create join request');
	}

	const user = await getUserInfo(req.currentUser.uid);

    res.status(200).json({status: 'OK', value: user});
});