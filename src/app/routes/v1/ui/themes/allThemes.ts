import asyncMiddleware from 'middleware-async';
import {Request, Response} from 'express';
import {Filters, OrderBy, getAllRecruitingThemes, getAllThemesForUser, getTheme} from '../../../../storage/themes';
import z from 'zod';
import {ApiError} from '../../api-error';
import {formatZodError} from '../../validators';
import {ThemeType} from '../../../../types';

const querySchema = z.object({
    userId: z.string().optional(),
	private: z.string().optional(),
	slotsCount: z.string().optional(),
	type: z.string().optional(),
	search: z.string().optional(),
	field: z.string().optional(),
	orgId: z.string(),
	order: z.union([
		z.literal('asc'),
		z.literal('desc')
	]).optional()
});

export const allThemesHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const validationResult = querySchema.safeParse(req.query);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const query = validationResult.data;

	const filters = {
		private: query.private,
		type: query.type,
		slotsCount: query.slotsCount ? parseInt(query.slotsCount, 10) : query.slotsCount
	} as Filters;

	const orderBy = {
		field: query.field,
		order: query.order
	} as OrderBy;
	
	let themes: number[];
	if(query.userId) {
		themes = await getAllThemesForUser(req.currentUser.uid, filters, orderBy);
	} else {
		themes = await getAllRecruitingThemes(parseInt(query.orgId, 10), filters, orderBy, query.search);
	}

    res.status(200).json(themes);
});