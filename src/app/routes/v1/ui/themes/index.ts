import {NextFunction, Router, Request, Response} from 'express';
import bodyParser from 'body-parser';
import {createThemeHandler} from './createTheme';
import {allThemesHandler} from './allThemes';
import {themeHandler} from './theme';
import {joinRequestHandler} from './joinRequest';
import {acceptJoinRequestHandler} from './acceptJoinRequest';
import {deleteRequestHandler} from './deleteRequest';

export const themeRouter: Router = Router()
	.use(bodyParser.json())
	.post('/create', createThemeHandler)
	.post('/join_request', joinRequestHandler)
	.post('/accept_request', acceptJoinRequestHandler)
	.get('/all', allThemesHandler)
	.delete('/delete_request', deleteRequestHandler)
	.get('/', themeHandler)
    .use((error: Error, _req: Request, res: Response, next: NextFunction) => 
		next(error)
    );