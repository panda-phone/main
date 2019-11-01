import * as express from 'express';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import * as Boom from '@hapi/boom';

import {consts} from 'app/consts';
import {Joi} from 'app/lib/joi';
import {validateBySchema} from 'app/lib/validator';
import {getGoodById, getGoodsList} from 'app/v1/providers/good';
import {getOrderItems} from 'app/v1/providers/order-item';
import {createCustomerOrder} from 'app/v1/providers/public';
import {selectSchema as goodSelectSchema} from 'app/v1/routers/good';
import {createOrderSchema as createOrderSchemaBase} from 'app/v1/routers/order';
import {Telegram} from 'app/lib/telegram';

export const router = express.Router();

export const createOrderSchema = createOrderSchemaBase.append({
    good_ids: Joi.stringArray().items(Joi.string()).single().required()
});

router.get('/get_good_list', wrap<Request, Response>(async (req, res) => {
    const reqQuery = {
        ...req.query,
        branch: consts.BRANCH.public
    };
    const query = validateBySchema(reqQuery, goodSelectSchema);
    res.json(await getGoodsList(query));
}));

router.get('/get_good/:id', wrap<Request, Response>(async (req, res) => {
    const response = await getGoodById(req.params.id);
    if (!response) {
        throw Boom.notFound('GOOD_NOT_EXIST');
    }

    res.json(response);
}));

router.post('/create_order', wrap<Request, Response>(async (req, res) => {
    const body = validateBySchema(req.body, createOrderSchema);

    try {
        const orderId = await createCustomerOrder(body);
        sendNewOrderToWorkGroup(orderId, req.originalUrl);
        res.json({orderId});
    } catch (error) {
        Telegram.sendToWorkChat(Telegram.NewOrderError(JSON.stringify({
            body,
            error: error.message,
            stack: error.stack
        })), req.originalUrl);
        throw error;
    }
}));

router.get('/get_consts', wrap<Request, Response>(async (req, res) => {
    res.json(consts);
}));

async function sendNewOrderToWorkGroup(orderId: string, originalUrl: string) {
    const orderItems = await getOrderItems(orderId);
    const ammount = orderItems.reduce<number>((res, {price, discount}) => {
        res += price * ((100 - discount) / 100);
        return res;
    }, 0);
    Telegram.sendToWorkChat(Telegram.NewOrder(orderId, ammount), originalUrl);
}
