import {Agent as HttpAgent} from 'http';
import {Agent as HttpsAgent} from 'https';
import * as got from 'got';

import {config} from 'app/config';
import {logger} from 'app/lib/logger';

const httpAgent = new HttpAgent({keepAlive: true});
const httpsAgent = new HttpsAgent({keepAlive: true});

interface RequestParams {
    query?: any;
    headers?: any;
    body?: any;
    method?: 'GET' | 'POST';
    json?: boolean;
    encoding?: string | null;
    originalUrl: any;
}

export async function doRequest(url: string, {
    query = '',
    headers = {},
    body = undefined,
    method = 'GET',
    json,
    encoding = 'utf-8',
    originalUrl
}: RequestParams) {
    const logMessage = `${originalUrl} => ${method} => ${url}?${query}, with body => ${JSON.stringify(body)}`;

    try {
        const response = await got(url, {
            retries: config['request.retries'],
            timeout: config['request.timeout'],
            method,
            query,
            body,
            json,
            headers,
            encoding,
            agent: {
                http: httpAgent,
                https: httpsAgent
            }
        } as any);

        logger.debug(`${logMessage} => ${response.statusCode}`);
        return response;
    } catch (error) {
        logger.error(`${logMessage} => ${error.statusCode || error.code}${getErrorBody(error)}`);
        throw error;
    }
}

function getErrorBody(error: any) {
    if (error.response && error.response.body) {
        return ` (message: ${error.response.body.toString('utf8')})`;
    }

    return '';
}
