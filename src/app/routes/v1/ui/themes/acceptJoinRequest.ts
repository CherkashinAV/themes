import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {ApiError} from '../../api-error';
import {Request, Response} from 'express';
import {formatZodError} from '../../validators';
import {getUserIdByUid} from '../../../../storage/user';
import {deleteExcessRequests, deleteJoinRequest} from '../../../../storage/joinRequests';
import {getGroup, joinGroup} from '../../../../storage/group';
import {getThemeByGroup, updateStatus} from '../../../../storage/themes';

const bodySchema = z.object({
	groupId: z.number(),
	userUid: z.string().uuid()
});

export const acceptJoinRequestHandler = asyncMiddleware(async (req: Request, res: Response) => {
    const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	if (req.currentUser.role !== 'mentor') {
		throw new ApiError('NOT_ENOUGH_RIGHTS', 403, 'Not enough rights to accept join requests');
	}

	const userId = await getUserIdByUid(body.userUid);

	const deleteResult = await deleteJoinRequest(body.groupId, userId);

	if (!deleteResult) {
		throw new Error('Failed to delete join request');
	}

	const joinResult = await joinGroup(body.groupId, userId);

	if (!joinResult) {
		throw new Error('Failed to join group');
	}

	const group = await getGroup(body.groupId);

	if (!group) {
		throw new Error('Failed to get a group');
	}
	
	const theme = await getThemeByGroup(group.id);

	if (!theme) {
		throw new Error('Failed to get theme');
	}
	if (group.size === group.participants.length) {
		updateStatus(theme.id, 'staffed');
	}

	if (theme.type === 'graduation') {
		const result = await deleteExcessRequests('graduation', userId);

		if (!result) {
			throw new Error('Failed delete excess requests');
		}
	}

    res.status(200).json({status: 'OK'});
});