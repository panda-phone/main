import * as Joi from '@hapi/joi';
import * as Boom from '@hapi/boom';

export function validateBySchema<T>(object: any, schema: Joi.Schema, options?: Joi.ValidationOptions): T {
    const result = schema.validate(object, options);
    if (result.error) {
        throw Boom.badRequest(result.error.details.map(({message}) => message).join(', '));
    }

    return result.value;
}
