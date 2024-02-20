import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {ApiError} from '../../api-error';
import {Request, Response} from 'express';
import {formatZodError} from '../../validators';
import {getUserDetails} from '../../../../storage/user';
import {passportProvider} from '../../../../providers/passport';

const querySchema = z.object({
    userId: z.string().uuid()
});

export const getProfileHandler = asyncMiddleware(async (req: Request, res: Response) => {
    const validationResult = querySchema.safeParse(req.query);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const query = validationResult.data;

    let userInfo = req.currentUser;
    if (query.userId !== req.currentUser.uid) {
        const userInfoResponse = await passportProvider.userInfo(query.userId);

        if (!userInfoResponse.ok) {
            throw userInfoResponse.error;
        }

        userInfo = userInfoResponse.value;
    }

    const userDetails = await getUserDetails(query.userId)

    res.status(200).json({
        ...userInfo,
        ...userDetails,
        id: undefined
    });
});