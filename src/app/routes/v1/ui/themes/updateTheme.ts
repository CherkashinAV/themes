import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {ApiError} from '../../api-error';
import {Request, Response} from 'express';
import {formatZodError} from '../../validators';
import {getUserInfo} from '../../../../integration/user';
import {createEmptyGroup, updateGroupSize} from '../../../../storage/group';
import {createTheme, getTheme, updateTheme} from '../../../../storage/themes';

const bodySchema = z.object({
	id: z.number(),
	title: z.string(),
	shortDescription: z.string(),
	description: z.string(),
	private: z.boolean(),
	executorsCount: z.number(),
	teachingMaterials: z.array(z.object({
		title: z.string(),
		link: z.string().url()
	})).nullable(),
	type: z.enum(['course', 'graduation', 'contest', 'pet', 'hackathon']),
	joinDate: z.string(),
	realizationDates: z.object({
		from: z.string(),
		to: z.string()
	})
});

export const updateThemeHandler = asyncMiddleware(async (req: Request, res: Response) => {
    const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	const currentTheme = await getTheme(body.id);

	if (!currentTheme) {
		throw new Error('Failed to get theme');
	}

	if(currentTheme.executorsGroup.size !== body.executorsCount) {
		const updateResult = await updateGroupSize(currentTheme.executorsGroup.id, body.executorsCount);
		if (!updateResult) {
			throw new Error('Failed to update group');
		}
	}

	const updateResult = await updateTheme({
		id: body.id,
		description: body.description,
		shortDescription: body.shortDescription,
		private: body.private,
		title: body.title,
		teachingMaterials: body.teachingMaterials ?? null,
		type: body.type,
		joinDate: body.joinDate,
		realizationDates: body.realizationDates
	});

	if(!updateResult) {
		throw new Error('Failed to update theme');
	}

    res.status(200).json({status: 'OK'});
});