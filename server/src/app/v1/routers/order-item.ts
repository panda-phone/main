import * as express from 'express';
import * as Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';

import {consts} from 'app/consts';
import {Joi} from 'app/lib/joi';
import {validateBySchema} from 'app/lib/validator';
import {executeInTransaction} from 'app/lib/db-client';
import {
    getOrderItemById,
    getOrderItems,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem
} from 'app/v1/providers/order-item';

export const router = express.Router();

const orderItemSchema = Joi.object().keys({
    order_id: Joi.string(),
    good_id: Joi.string(),
    serial_number: Joi.string().allow(null)
});

const createOrderItemSchema = orderItemSchema.append({
    order_id: Joi.string().required(),
    good_id: Joi.string().required()
});

router.get('/:orderId/get_list', wrap<Request, Response>(async (req, res) => {
    res.json(await getOrderItems(req.params.orderId));
}));

router.get('/:id/get', wrap<Request, Response>(async (req, res) => {
    const response = await getOrderItemById(req.params.id);
    if (!response) {
        throw Boom.notFound(consts.API_ERROR_CODE.ORDER_ITEM_NOT_EXIST);
    }

    res.json(response);
}));

router.post('/create', wrap<Request, Response>(async (req, res) => {
    const body = validateBySchema(req.body, createOrderItemSchema);

    try {
        const result = await executeInTransaction(async (client) => createOrderItem(client, body));
        res.json(result);
    } catch (error) {
        checkError(error);
        throw error;
    }
}));

router.post('/:id/update', wrap<Request, Response>(async (req, res) => {
    const body = validateBySchema(req.body, orderItemSchema);
    try {
        await updateOrderItem(req.params.id, body);
        res.json({});
    } catch (error) {
        checkError(error);
        throw error;
    }
}));

router.post('/:id/delete', wrap<Request, Response>(async (req, res) => {
    await deleteOrderItem(req.params.id);
    res.json({});
}));

function checkError(error: any) {
    if (error.message.includes('unique constraint "order_item_serial_number_key"')) {
        throw Boom.badRequest(consts.API_ERROR_CODE.ORDER_ITEM_UNIQUE_SERIAL_NUMBER);
    }

    if (error.message.includes('violates foreign key constraint "order_item_good_id_fkey"')) {
        throw Boom.badRequest(consts.API_ERROR_CODE.GOOD_NOT_EXIST);
    }
}
