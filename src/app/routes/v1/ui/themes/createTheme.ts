import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {ApiError} from '../../api-error';
import {Request, Response} from 'express';
import {formatZodError} from '../../validators';
import {getUserInfo} from '../../../../integration/user';
import {createEmptyGroup} from '../../../../storage/group';
import {createTheme} from '../../../../storage/themes';

const bodySchema = z.object({
	title: z.string(),
	shortDescription: z.string().optional(),
	description: z.string(),
	private: z.boolean(),
	executorsCount: z.number(),
	type: z.enum(['course', 'graduation', 'contest', 'pet', 'hackathon'])
});

export const createThemeHandler = asyncMiddleware(async (req: Request, res: Response) => {
    const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	const groupId = await createEmptyGroup(body.executorsCount);

	if (!groupId) {
		throw new Error('Failed to create empty group');
	}

	const creator = await getUserInfo(req.currentUser.uid);

	const themeId = await createTheme({
		creator: creator.id,
		description: body.description,
		shortDescription: body.shortDescription,
		executorsGroup: groupId,
		private: body.private,
		title: body.title,
		approver: req.currentUser.role === 'mentor' ? creator.id : undefined,
		type: body.type
	});

	if(!themeId) {
		throw new Error('Failed to create theme');
	}

    res.status(200).json({status: 'OK', themeId});
});