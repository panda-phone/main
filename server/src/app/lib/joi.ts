import * as BaseJoi from '@hapi/joi';

export const Joi = BaseJoi.extend((joi) => ({
    type: 'stringArray',
    base: joi.array(),
    coerce: (value: any, _: BaseJoi.CustomHelpers) => {
        if (value && value.split) {
            return {
                value: value.split(',')
            };
        }

        return {value};
    }
}));
