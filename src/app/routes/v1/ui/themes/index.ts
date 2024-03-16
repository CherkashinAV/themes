import {NextFunction, Router, Request, Response} from 'express';
import bodyParser from 'body-parser';
import {createThemeHandler} from './createTheme';
import {allThemesHandler} from './allThemes';
import {themeHandler} from './theme';
import {joinRequestHandler} from './joinRequest';
import {acceptJoinRequestHandler} from './acceptJoinRequest';
import {deleteRequestHandler} from './deleteRequest';
import {updateThemeHandler} from './updateTheme';
import {mentorInviteHandler} from './mentorInvite';

export const themeRouter: Router = Router()
	.use(bodyParser.json())
	.post('/create', createThemeHandler)
	.post('/join_request', joinRequestHandler)
	.post('/accept_request', acceptJoinRequestHandler)
	.post('/invite_mentor', mentorInviteHandler)
	.get('/all', allThemesHandler)
	.get('/', themeHandler)
	.delete('/delete_request', deleteRequestHandler)
	.patch('/update', updateThemeHandler)
    .use((error: Error, _req: Request, res: Response, next: NextFunction) => 
		next(error)
    );