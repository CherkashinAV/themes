import asyncMiddleware from 'middleware-async';
import {Request, Response} from 'express';
import {ApiError} from '../../api-error';
import {formatZodError} from '../../validators';
import z from 'zod';
import {createRule} from '../../../../storage/rules';

const bodySchema = z.object({
	title: z.string(),
	type: z.enum(['course', 'graduation', 'contest', 'pet', 'hackathon']),
	expirationDate: z.string(),
	joinDate: z.string(),
	realizationDates: z.object({
		from: z.string(),
		to: z.string()
	}),
	downloadLink: z.string().url(),
	organizationId: z.number()
});

export const createRuleHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	const createRuleResult = await createRule(body);

	if (!createRuleResult) {
		throw new Error('Failed to create rule');
	}

	res.status(200).json({
		status: 'OK',
		data: createRuleResult
	});
});