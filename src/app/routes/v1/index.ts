import {NextFunction, Request, Response, Router} from 'express';
import bodyParser from 'body-parser';
import {ApiError} from './api-error';
import {logger} from '../../lib/logger';

export const v1Router: Router = Router()
    .use(bodyParser.json())
    .use((error: Error, _req: Request, res: Response, next: NextFunction) => {
        if (error instanceof ApiError) {
            const errorBody = {
                code: error.code,
                message: error.message
            };

            logger.error(error.message);
            res.status(error.status).json(errorBody);
        } else {
            next(error);
        }
    });
