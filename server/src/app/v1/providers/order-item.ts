import * as Knex from 'knex';
import * as pg from 'pg';
import * as Boom from '@hapi/boom';

import {executeReadQuery} from 'app/lib/db-client';
import {consts} from 'app/consts';
import {generateId} from 'app/lib/id-generator';
import {getOrderById} from 'app/v1/providers/order';

const knex = Knex({client: 'pg'});

const baseQuery: any[] = [
    `${consts.TABLE.orderItem}.id as id`,
    `${consts.TABLE.orderItem}.order_id as orderId`,
    `${consts.TABLE.orderItem}.good_id as goodId`,
    `${consts.TABLE.orderItem}.serial_number as serialNumber`,
    `${consts.TABLE.good}.category`,
    `${consts.TABLE.good}.subcategory`,
    `${consts.TABLE.good}.original`,
    `${consts.TABLE.good}.branch`,
    `${consts.TABLE.good}.properties`,
    `${consts.TABLE.good}.price`,
    `${consts.TABLE.good}.discount`,
    `${consts.TABLE.good}.updated`
];

export async function getOrderItemById(id: string) {
    const query = knex(consts.TABLE.orderItem)
        .select(baseQuery)
        .innerJoin(consts.TABLE.good, `${consts.TABLE.orderItem}.good_id`, `${consts.TABLE.good}.id`)
        .where(`${consts.TABLE.orderItem}.id`, id);

    const result = await executeReadQuery(query.toString());
    return result.data.rows[0];
}

export async function createOrderItem(client: pg.PoolClient, body: any) {
    const query = knex(consts.TABLE.orderItem).insert({
        ...body,
        id: generateId()
    }).returning('id');
    const result = await client.query(query.toString());
    return result.rows[0];
}

export async function createOrderItems(client: pg.PoolClient, orderId: string, goodIds: string[]) {
    const query = knex(consts.TABLE.orderItem)
        .insert(goodIds.map((goodId: string) => ({
            id: generateId(),
            order_id: orderId,
            good_id: goodId
        })));

    await client.query(query.toString());
}

export async function getOrderItems(orderId: string): Promise<any[]> {
    const order = await getOrderById(orderId);
    if (!order) {
        throw Boom.badRequest(consts.API_ERROR_CODE.ORDER_NOT_EXIST);
    }

    const query = knex(consts.TABLE.orderItem)
        .select(baseQuery)
        .innerJoin(consts.TABLE.good, `${consts.TABLE.orderItem}.good_id`, `${consts.TABLE.good}.id`)
        .where(`${consts.TABLE.orderItem}.order_id`, orderId);

    const result = await executeReadQuery(query.toString());
    return result.data.rows;
}

export async function updateOrderItem(id: string, body: any) {
    const orderItem = await getOrderItemById(id);
    if (!orderItem) {
        throw Boom.badRequest(consts.API_ERROR_CODE.ORDER_ITEM_NOT_EXIST);
    }

    const query = knex(consts.TABLE.orderItem).where({id}).update(body);
    await executeReadQuery(query.toString());
}

export async function deleteOrderItem(id: string) {
    const query = knex(consts.TABLE.orderItem).where({id}).delete();
    await executeReadQuery(query.toString());
}
