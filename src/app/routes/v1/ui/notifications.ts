import asyncMiddleware from 'middleware-async';
import {Request, Response} from 'express';
import {getNotifications} from '../../../storage/notifications';

export const notificationsHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const notifications = await getNotifications(req.currentUser.uid);

    res.status(200).json(notifications);
});