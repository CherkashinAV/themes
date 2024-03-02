import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {ApiError} from '../../api-error';
import {Request, Response} from 'express';
import {formatZodError} from '../../validators';
import {checkUserIsExist, createUserRecord, updateProfile} from '../../../../storage/user';

const bodySchema = z.object({
    description: z.string()
});

export const updateProfileHandler = asyncMiddleware(async (req: Request, res: Response) => {
    const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

    const updateResult = await updateProfile(req.currentUser.uid, {description: body.description});

	if (!updateResult) {
		throw new Error('Update profile failed');
	}

    res.status(200).json({status: 'OK'});
});