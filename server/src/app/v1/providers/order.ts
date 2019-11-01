import * as Knex from 'knex';
import * as pg from 'pg';
import * as Boom from '@hapi/boom';

import {executeReadQuery} from 'app/lib/db-client';
import {ResponseMeta} from 'app/utils/types';
import {consts} from 'app/consts';
import {generateId} from 'app/lib/id-generator';

interface OrdersResponse {
    meta: ResponseMeta;
    data: any[];
}

const knex = Knex({client: 'pg'});

const baseQuery: any[] = [
    'id',
    'customer_name as customerName',
    'customer_phone as customerPhone',
    'called',
    'delivery_address as deliveryAddress',
    'delivery_date as deliveryDate',
    'created'
];

export async function getOrderById(id: string) {
    const query = knex(consts.TABLE.order).select(baseQuery.concat([
        'resolution_date as resolutionDate',
        '_resolution_status as resolutionStatus'
    ])).where({id});
    const result = await executeReadQuery(query.toString());
    return result.data.rows[0];
}

export async function createOrder(client: pg.PoolClient, body: any) {
    const query = knex(consts.TABLE.order).insert({
        ...body,
        id: generateId()
    }).returning('id');
    const result = await client.query(query.toString());
    return result.rows[0];
}

export async function getOrders(params: any): Promise<OrdersResponse> {
    const {
        limit, offset, order,
        resolutionStatus
    } = params;
    const query = knex(consts.TABLE.order)
        .select(baseQuery.concat([
            'resolution_date as resolutionDate',
            '_resolution_status as resolutionStatus',
            {fullCount: knex.raw('COUNT(*) OVER ()')}
        ]))
        .limit(limit)
        .offset(offset)
        .orderBy('created', order);

    if (resolutionStatus) {
        query.where('_resolution_status', resolutionStatus);
    } else if (resolutionStatus === null) {
        query.whereNull('_resolution_status');
    }

    const result = await executeReadQuery(query.toString());
    return {
        meta: {
            total: !result.data.rows[0] ? 0 : Number(result.data.rows[0].fullCount),
            limit, offset
        },
        data: result.data.rows.map((row) => {
            delete row.fullCount;
            return row;
        })
    };
}

export async function updateOrder(id: string, body: any) {
    const order = await getOrderById(id);
    if (!order) {
        throw Boom.badRequest(consts.API_ERROR_CODE.ORDER_NOT_EXIST);
    }

    const query = knex(consts.TABLE.order)
        .where({id})
        .update({
            ...body,
            delivery_date: body.delivery_date ?
                (new Date(Date.parse(body.delivery_date))).toUTCString() :
                body.delivery_date
        })
        .returning(baseQuery);

    const result = await executeReadQuery(query.toString());
    return result.data.rows[0];
}
