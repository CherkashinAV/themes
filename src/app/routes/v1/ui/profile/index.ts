import {NextFunction, Router, Request, Response} from 'express';
import {getProfileHandler} from './getProfile';
import bodyParser from 'body-parser';
import {updateProfileHandler} from './updateProfile';

export const profileRouter: Router = Router()
	.use(bodyParser.json())
	.patch('/update', updateProfileHandler)
	.get('/get', getProfileHandler)
    .use((error: Error, _req: Request, res: Response, next: NextFunction) => 
		next(error)
    );