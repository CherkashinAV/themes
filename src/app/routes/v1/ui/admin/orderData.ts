import asyncMiddleware from 'middleware-async';
import {Request, Response} from 'express';
import z from 'zod';
import {ApiError} from '../../api-error';
import {formatZodError} from '../../validators';
import {getOrderData} from '../../../../storage/themes';

const querySchema = z.object({
    ruleId: z.string()
});

export const orderDataHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const validationResult = querySchema.safeParse(req.query);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const query = validationResult.data;

	const orderData = await getOrderData(parseInt(query.ruleId, 10));

    res.status(200).json(orderData);
});