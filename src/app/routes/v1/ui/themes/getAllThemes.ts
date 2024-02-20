import asyncMiddleware from 'middleware-async';
import {Request, Response} from 'express';
import {getAllRecruitingThemes, getTheme} from '../../../../storage/themes';

export const getThemeHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const themes = await getAllRecruitingThemes();

    res.status(200).json(themes);
});