import {NextFunction, Router, Request, Response} from 'express';
import {profileRouter} from './profile';
import {themeRouter} from './themes';

export const uiRouter: Router = Router()
	.use('/profile', profileRouter)
	.use('/theme', themeRouter)
    .use((error: Error, _req: Request, res: Response, next: NextFunction) => 
		next(error)
    );