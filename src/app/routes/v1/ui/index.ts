import {NextFunction, Router, Request, Response} from 'express';
import {profileRouter} from './profile';

export const uiRouter: Router = Router()
	.use('/profile', profileRouter)
    .use((error: Error, _req: Request, res: Response, next: NextFunction) => 
		next(error)
    );