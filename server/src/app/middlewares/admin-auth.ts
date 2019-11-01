import {URL} from 'url';
import {Request, Response} from 'express';
import * as FormData from 'form-data';
import {wrap} from 'async-middleware';
import * as got from 'got';
import * as jwt from 'jsonwebtoken';
import * as Knex from 'knex';

import {logger} from 'app/lib/logger';
import {doRequest} from 'app/lib/do-request';
import {config} from 'app/config';
import * as db from 'app/lib/db-client';

interface UserData {
    id: string;
    login: string;
}

const knex = Knex({client: 'pg'});
const PRIVATE_TOKEN = config['env.telegramBotApiToken'];

export const adminAuthMiddleware = wrap<Request, Response>(async (req, res, next) => {
    if (config['admin.disableAuth']) {
        req.adminForbidden = false;
        next();
        return;
    }

    const adminSessionToken = req.cookies['admin_session'];
    const code = req.query.code;
    delete req.query.code;

    if (!code && !adminSessionToken) {
        req.adminForbidden = true;
        next();
        return;
    }

    if (!adminSessionToken) {
        logger.info(`Request without token: ${JSON.stringify({
            url: req.originalUrl,
            query: req.query,
            method: req.method,
            ip: req.ip,
            headers: req.headers
        })}`);

        const authToken = await getAuthToken(code, req.originalUrl);
        if (!authToken) {
            req.adminForbidden = true;
            next();
            return;
        }

        const userData = await getUserData(authToken, req.originalUrl);
        logger.info(`User data: ${JSON.stringify(userData)}`);
        if (!userData) {
            req.adminForbidden = true;
            next();
            return;
        }

        const allowed = await checkAccess(userData);
        if (!allowed) {
            req.adminForbidden = true;
            next();
            return;
        }

        const token = jwt.sign(userData, PRIVATE_TOKEN);
        res.json({token});
    } else {
        try {
            jwt.verify(adminSessionToken, PRIVATE_TOKEN);
        } catch (err) {
            logger.info(`Invalid token: ${err.message}`);
            req.adminForbidden = true;
        } finally {
            next();
        }
    }
});

async function getAuthToken(code: string, originalUrl: string): Promise<string | undefined> {
    let res: got.Response<any>;
    try {
        const url = new URL(`/token`, 'https://oauth.yandex.ru');

        const body = new FormData();
        body.append('grant_type', 'authorization_code');
        body.append('code', code);
        body.append('client_id', config['env.yandexOauthId']);
        body.append('client_secret', config['env.yandexOauthPassword']);

        res = await doRequest(url.toString(), {
            method: 'POST',
            body,
            originalUrl
        });
    } catch (_) {
        return;
    }

    if (res.statusCode !== 200) {
        return;
    }

    return JSON.parse(res.body).access_token;
}

async function getUserData(authToken: string, originalUrl: string): Promise<UserData | undefined> {
    let res: got.Response<any>;
    try {
        const url = new URL(`/info`, 'https://login.yandex.ru');
        res = await doRequest(url.toString(), {
            method: 'GET',
            json: true,
            query: {
                format: 'json'
            },
            headers: {
                Authorization: `OAuth ${authToken}`
            },
            originalUrl
        });
    } catch (err) {
        return;
    }

    if (res.statusCode !== 200) {
        return;
    }

    return {
        id: res.body.id,
        login: res.body.login
    };
}

async function checkAccess(userData: UserData): Promise<boolean> {
    const query = knex.select('*').from('admin').where({
        yandex_user_id: userData.id,
        login: userData.login
    });

    const result = await db.executeReadQuery(query.toString());
    if (!result || !result.data || !result.data.rows) {
        return false;
    }

    return result.data.rows.length > 0;
}
