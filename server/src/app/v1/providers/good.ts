import * as Knex from 'knex';
import * as Boom from '@hapi/boom';

import {executeReadQuery} from 'app/lib/db-client';
import {ResponseMeta} from 'app/utils/types';
import {consts} from 'app/consts';
import {generateId} from 'app/lib/id-generator';

interface GoodsResponse {
    meta: ResponseMeta;
    data: any[];
}

const knex = Knex({client: 'pg'});

export async function getGoodById(id: string) {
    const query = knex(consts.TABLE.good).select('*').where({id});
    const result = await executeReadQuery(query.toString());
    return result.data.rows[0];
}

export async function getGoodsList(params: any): Promise<GoodsResponse> {
    const {
        limit, offset, order,
        id, category, subcategory,
        original, branch
    } = params;
    const query = knex(consts.TABLE.good)
        .select([
            '*',
            {fullCount: knex.raw('COUNT(*) OVER ()')}
        ])
        .limit(limit)
        .offset(offset)
        .orderBy('updated', order);

    if (id.length > 0) {
        query.whereIn('id', id);
    }

    if (category.length > 0) {
        query.whereIn('category', category);
    }

    if (subcategory.length > 0) {
        query.whereIn('subcategory', subcategory);
    }

    if (original.length > 0) {
        query.whereIn('original', original);
    }

    if (branch.length > 0) {
        query.whereIn('branch', branch);
    }

    /* query.andWhere(function() {
        propsIphoneMemory.forEach((value: string) => {
            this.orWhereRaw('properties ->> \'iphoneMemory\' = :value', {value});
        });
    }); */

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

export async function createGood(body: any) {
    const query = knex(consts.TABLE.good).insert({
        ...body,
        id: generateId(),
        properties: JSON.stringify(body.properties)
    }).returning('id');
    const result = await executeReadQuery(query.toString());

    return result.data.rows[0];
}

export async function updateGood(id: string, body: any) {
    const good = await getGoodById(id);
    if (!good) {
        throw Boom.badRequest(consts.API_ERROR_CODE.GOOD_NOT_EXIST);
    }

    const query = knex(consts.TABLE.good).where({id}).update({
        ...body,
        properties: JSON.stringify(body.properties)
    });

    await executeReadQuery(query.toString());
}
