import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {ApiError} from '../../api-error';
import {Request, Response} from 'express';
import {formatZodError} from '../../validators';
import {checkUserIsExist, createUserRecord, getUserDetails} from '../../../../storage/user';
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

    const isUserExists = await checkUserIsExist(req.currentUser.uid);

    if (!isUserExists) {
        const creationResult = await createUserRecord(req.currentUser.uid);

        if  (!creationResult) {
            throw new Error('Create user record failed');
        }
    }

    const userDetails = await getUserDetails(query.userId)

    res.status(200).json({
        ...userInfo,
        ...userDetails,
        id: undefined
    });
});