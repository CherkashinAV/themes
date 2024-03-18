import {NextFunction, Router, Request, Response} from 'express';
import bodyParser from 'body-parser';
import {notificationsHandler} from './notifications';
import {notificationLookHandler} from './look';

export const notificationsRouter: Router = Router()
	.use(bodyParser.json())
	.get('/', notificationsHandler)
	.patch('/look', notificationLookHandler)
    .use((error: Error, _req: Request, res: Response, next: NextFunction) => 
		next(error)
    );