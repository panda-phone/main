import * as express from 'express';
import * as Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';

import {getValues, consts} from 'app/consts';
import {Joi} from 'app/lib/joi';
import {validateBySchema} from 'app/lib/validator';
import {baseSelectSchemaMap} from 'app/utils/db';
import {createOrder, getOrders, getOrderById, updateOrder} from 'app/v1/providers/order';
import {executeInTransaction} from 'app/lib/db-client';
import {Telegram} from 'app/lib/telegram';

export const router = express.Router();

const orderSchema = Joi.object().keys({
    customer_name: Joi.string(),
    customer_phone: Joi.string(),
    called: Joi.boolean(),
    delivery_address: Joi.string().allow(null),
    delivery_date: Joi.date().allow(null),
    // Only use in test cases
    resolution_date: Joi.date(),
    _resolution_status: Joi.string().valid(...getValues('ORDER_STATUS'))
});

export const createOrderSchema = orderSchema.append({
    customer_name: Joi.string().required(),
    customer_phone: Joi.string().required()
});

export const selectSchema = Joi.object().keys({}).append(baseSelectSchemaMap);

router.get('/get_list_opened', wrap<Request, Response>(async (req, res) => {
    const query = validateBySchema(req.query, selectSchema);
    res.json(await getOrders({
        ...query,
        resolutionStatus: null
    }));
}));

router.get('/:id/get', wrap<Request, Response>(async (req, res) => {
    const response = await getOrderById(req.params.id);
    if (!response) {
        throw Boom.notFound(consts.API_ERROR_CODE.ORDER_NOT_EXIST);
    }

    res.json(response);
}));

router.post('/create', wrap<Request, Response>(async (req, res) => {
    const body = validateBySchema(req.body, createOrderSchema);

    const result = await executeInTransaction(async (client) => createOrder(client, body));
    res.json(result);
}));

router.post('/:id/update', wrap<Request, Response>(async (req, res) => {
    const body = validateBySchema(req.body, orderSchema);
    await updateOrder(req.params.id, body);
    res.json({});
}));

router.post('/:id/resolve', wrap<Request, Response>(async (req, res) => {
    const orderId = req.params.id;
    try {
        await updateOrder(orderId, {
            _resolution_status: consts.ORDER_STATUS.resolve
        });
        Telegram.sendToWorkChat(Telegram.OrderResolved(orderId, 'resolve'), req.originalUrl);
        res.json({});
    } catch (error) {
        if (error.message === consts.API_ERROR_CODE.EMPTY_SERIAL_NUMBER) {
            throw Boom.badRequest(error.message);
        }
        throw error;
    }
}));

router.post('/:id/reject', wrap<Request, Response>(async (req, res) => {
    const orderId = req.params.id;
    await updateOrder(orderId, {
        _resolution_status: consts.ORDER_STATUS.reject
    });
    Telegram.sendToWorkChat(Telegram.OrderResolved(orderId, 'reject'), req.originalUrl);
    res.json({});
}));
