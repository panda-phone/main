import * as Joi from '@hapi/joi';

import {validateBySchema} from 'app/lib/validator';
import {consts, getValues} from 'app/consts';

export const baseSelectSchemaMap = {
    limit: Joi.number().optional().default(consts.MAX_LOAD_FOR_PAGE),
    offset: Joi.number().optional().default(0),
    order: Joi.string().valid(...getValues('SORT_ORDER')).optional().default(consts.SORT_ORDER.asc)
};

const baseSelectSchema = Joi.object().keys(baseSelectSchemaMap);

export function validateBaseSelect(query: any) {
    return validateBySchema(query, baseSelectSchema);
}
