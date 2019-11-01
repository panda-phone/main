import * as express from 'express';
import * as cors from 'cors';
import * as Boom from '@hapi/boom';

import {adminAuthMiddleware} from 'app/middlewares/admin-auth';
import {router as publicRouter} from 'app/v1/routers/public';
import {router as goodRouter} from 'app/v1/routers/good';
import {router as orderRouter} from 'app/v1/routers/order';
import {router as orderItemRouter} from 'app/v1/routers/order-item';
import {config} from 'app/config';

export const router = express.Router();

router
    .use(cors({
        origin: config['cors.origin'],
        credentials: true
    }))
    .use('/public', publicRouter)
    .use(adminAuthMiddleware)
    .use((req, _, next) => {
        if (req.adminForbidden) {
            const authUrl = [
                'https://oauth.yandex.ru/authorize?response_type=code',
                `client_id=${config['env.yandexOauthId']}`,
                `redirect_uri=${config['admin.authRedirect']}`
            ].join('&');

            throw Boom.forbidden(authUrl);
        }

        next();
    })
    .get('/check_access', (_, res) => res.send())
    .use((_req, _res, next) => setTimeout(next, 500))
    .use('/good', goodRouter)
    .use('/order', orderRouter)
    .use('/order_item', orderItemRouter);
