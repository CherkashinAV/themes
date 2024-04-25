import {NextFunction, Router, Request, Response} from 'express';
import bodyParser from 'body-parser';
import {inviteHandler} from './invite';
import {createRuleHandler} from './createRule';
import {rulesHandler} from './rules';
import {orderDataHandler} from './orderData';

export const adminRouter: Router = Router()
	.use(bodyParser.json())
	.post('/invite', inviteHandler)
	.post('/create_rule', createRuleHandler)
	.get('/rules', rulesHandler)
	.get('/order_data', orderDataHandler)
    .use((error: Error, _req: Request, res: Response, next: NextFunction) => 
		next(error)
    );