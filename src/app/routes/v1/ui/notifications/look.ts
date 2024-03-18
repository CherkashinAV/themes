import asyncMiddleware from 'middleware-async';
import {Request, Response} from 'express';
import {notificationLook} from '../../../../storage/notifications';
import z from 'zod';
import {ApiError} from '../../api-error';
import {formatZodError} from '../../validators';

const bodySchema = z.object({
	notificationId: z.number()
});

export const notificationLookHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	const lookResult = await notificationLook(body.notificationId);

    if (!lookResult) {
        throw new Error('Failed to update notification');
    }

    res.status(200).json({
        status: 'OK'
    });
});