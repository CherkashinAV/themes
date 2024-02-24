import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {ApiError} from '../../api-error';
import {Request, Response} from 'express';
import {formatZodError} from '../../validators';
import {getTheme} from '../../../../storage/themes';

const querySchema = z.object({
    themeId: z.number()
});

export const getThemeHandler = asyncMiddleware(async (req: Request, res: Response) => {
    const validationResult = querySchema.safeParse(req.query);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const query = validationResult.data;

    const theme = await getTheme(query.themeId);

	if (!theme) {
		throw new Error('Failed to get theme');
	}

    res.status(200).json(theme);
});