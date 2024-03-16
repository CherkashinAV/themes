import {NextFunction, Router, Request, Response} from 'express';
import {profileRouter} from './profile';
import {themeRouter} from './themes';
import {notificationsHandler} from './notifications';

export const uiRouter: Router = Router()
	.use('/profile', profileRouter)
	.use('/theme', themeRouter)
	.get('/notifications', notificationsHandler)
    .use((error: Error, _req: Request, res: Response, next: NextFunction) => 
		next(error)
    );