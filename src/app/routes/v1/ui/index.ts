import {NextFunction, Router, Request, Response} from 'express';
import {profileRouter} from './profile';
import {themeRouter} from './themes';
import {notificationsRouter} from './notifications';

export const uiRouter: Router = Router()
	.use('/profile', profileRouter)
	.use('/theme', themeRouter)
	.use('/notifications', notificationsRouter)
    .use((error: Error, _req: Request, res: Response, next: NextFunction) => 
		next(error)
    );