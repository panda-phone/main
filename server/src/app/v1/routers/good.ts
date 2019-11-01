import * as express from 'express';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import * as Boom from '@hapi/boom';

import {validateBySchema} from 'app/lib/validator';
import {Joi} from 'app/lib/joi';
import {getValues, consts} from 'app/consts';
import {
    createGood,
    updateGood,
    getGoodById,
    getGoodsList
} from 'app/v1/providers/good';
import {baseSelectSchemaMap} from 'app/utils/db';

export const router = express.Router();

const updateBranchSchema = Joi.object().keys({
    branch: Joi.string().valid(...getValues('BRANCH')).default(consts.BRANCH.draft)
});

const goodSchema = Joi.object().keys({
    category: Joi.string().valid(...getValues('GOOD_CATEGORY')),
    subcategory: Joi.string().valid(...getValues('GOOD_SUBCATEGORY')),
    original: Joi.boolean().optional(),
    branch: Joi.string().valid(...getValues('BRANCH')).default(consts.BRANCH.draft),

    properties: Joi.object().keys({
        brand: Joi.string().valid(...getValues('GOOD_BRAND')).required(),
        iphone: Joi.object().keys({
            memory: Joi.string().valid(...getValues('GOOD_IPHONE_MEMORY')).required(),
            model: Joi.string().valid(...getValues('GOOD_IPHONE_MODEL')).required(),
            color: Joi.string().valid(...getValues('GOOD_IPHONE_COLOR')).required()
        }),
        airpods: Joi.object().keys({
            wirelessCharging: Joi.boolean().required(),
            model: Joi.string().valid(...getValues('GOOD_AIRPODS_MODEL')).required(),
            color: Joi.string().valid(...getValues('GOOD_AIRPODS_COLOR')).required()
        })
    }).or('iphone', 'airpods'),

    price: Joi.number().positive().required(),
    discount: Joi.number().min(0).max(100).optional().default(0)
});

export const selectSchema = Joi.object().keys({
    id: Joi.stringArray().items(Joi.string()).single().default([]),
    category: Joi.stringArray().items(Joi.string().valid(...getValues('GOOD_CATEGORY'))).single().default([]),
    subcategory: Joi.stringArray().items(Joi.string().valid(...getValues('GOOD_SUBCATEGORY'))).single().default([]),
    original: Joi.stringArray().items(Joi.string().valid(...['true', 'false'])).single().default([]),
    branch: Joi.stringArray().items(Joi.string().valid(...getValues('BRANCH'))).single().default([])
}).append(baseSelectSchemaMap);

router.get('/get_list', wrap<Request, Response>(async (req, res) => {
    const query = validateBySchema(req.query, selectSchema);
    res.json(await getGoodsList(query));
}));

router.get('/:id/get', wrap<Request, Response>(async (req, res) => {
    const response = await getGoodById(req.params.id);
    if (!response) {
        throw Boom.notFound(consts.API_ERROR_CODE.GOOD_NOT_EXIST);
    }

    res.json(response);
}));

router.post('/create', wrap<Request, Response>(async (req, res) => {
    const body = validateBySchema(req.body, goodSchema);
    res.json(await createGood(body));
}));

router.post('/:id/update', wrap<Request, Response>(async (req, res) => {
    const body = validateBySchema(req.body, goodSchema);
    try {
        await updateGood(req.params.id, body);
        res.json({});
    } catch (error) {
        if (error.message === consts.API_ERROR_CODE.GOOD_USED_IN_ORDER) {
            throw Boom.badRequest(error.message);
        }
        throw error;
    }
}));

router.post('/:id/update_branch', wrap<Request, Response>(async (req, res) => {
    const body = validateBySchema(req.body, updateBranchSchema);
    try {
        await updateGood(req.params.id, body);
        res.json({});
    } catch (error) {
        if (error.message === consts.API_ERROR_CODE.GOOD_USED_IN_ORDER) {
            throw Boom.badRequest(error.message);
        }
        throw error;
    }
}));
