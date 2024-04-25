import asyncMiddleware from 'middleware-async';
import {Request, Response} from 'express';
import {getRules} from '../../../../storage/rules';
import z from 'zod';
import {ApiError} from '../../api-error';
import {formatZodError} from '../../validators';

const querySchema = z.object({
    organizationId: z.string()
});

export const rulesHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const validationResult = querySchema.safeParse(req.query);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const query = validationResult.data;

	const rules = await getRules(parseInt(query.organizationId, 10));

    res.status(200).json(rules ?? []);
});