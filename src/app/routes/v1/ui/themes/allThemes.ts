import asyncMiddleware from 'middleware-async';
import {Request, Response} from 'express';
import {getAllRecruitingThemes, getAllThemesForUser, getTheme} from '../../../../storage/themes';
import z from 'zod';
import {ApiError} from '../../api-error';
import {formatZodError} from '../../validators';

const querySchema = z.object({
    userId: z.string().optional()
});

export const allThemesHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const validationResult = querySchema.safeParse(req.query);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const query = validationResult.data;
	
	let themes: number[];
	if(query.userId) {
		themes = await getAllThemesForUser(req.currentUser.uid);
	} else {
		themes = await getAllRecruitingThemes();
	}

    res.status(200).json(themes);
});