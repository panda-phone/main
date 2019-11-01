import * as express from 'express';
import {Request, Response, NextFunction} from 'express';
import * as Boom from '@hapi/boom';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import {logger} from 'app/lib/logger';
import {router as v1Router} from 'app/v1';
import {config} from 'app/config';

declare global {
    namespace Express {
        interface Request {
            adminForbidden?: boolean;
        }
    }
}

export const app = express()
    .disable('trust proxy')
    .disable('x-powered-by')
    .use(cookieParser())
    .use(bodyParser.json())
    .get('/ping', (_: Request, res: Response) => res.end())
    .use('/v1', v1Router);

app.use((_req, _res, next) => next(Boom.notFound('Endpoint not found')));
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (Boom.isBoom(err)) {
        sendError(res, err);
    } else {
        logger.error(err.stack || err);
        sendError(res, Boom.internal(err));
    }
});

function sendError(res: Response, err: Boom.Boom): void {
    res.status(err.output.statusCode).json(err.output.payload);
}

if (!module.parent) {
    const port = config['env.appPort'];
    app.listen(port, () => logger.info(`Application started on port ${port}`));
}
