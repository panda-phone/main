import * as pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';

import {logger} from 'app/lib/logger';
import {config} from 'app/config';

type ClientCallback<T> = (client: pg.PoolClient) => Promise<T>;

interface DbConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
}

interface ExecuteResult<T> {
    data: T;
    connectionTime: number;
    executeTime: number;
}

const dbConfig = JSON.parse(fs.readFileSync(path.resolve('./server/configs/db.json')).toString());
if (config['env.appEnvironment'] === 'tests') {
    dbConfig.host = 'localhost';
}

const DB_CONFIG: DbConfig = {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port
};

const {Pool} = pg;

const pgConfig = {
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    database: DB_CONFIG.database,
    port: DB_CONFIG.port,
    idleTimeoutMillis: 1000 * 60 * 2,
    connectionTimeoutMillis: 2000,
    ...(config['db.ssl'] ? {
        ssl: {
            cert: fs.readFileSync(path.resolve('./server/res/allCAs.pem')).toString()
        }
    } : {})
};

const pool = new Pool(pgConfig);
pool.on('error', (error) => logger.error(`Connection database error: ${error}`));

async function executeInTransaction(callback: ClientCallback<any>) {
    const result = await executeWriteCallback(callback);
    return result.data;
}

async function executeWriteCallback<T>(callback: ClientCallback<T>): Promise<ExecuteResult<T>> {
    const result = await execute<T>(async (client: pg.PoolClient) => {
        let result;
        try {
            await client.query('BEGIN');
            result = await callback(client);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }

        return result;
    }, pool);

    return result;
}

async function executeReadQuery(query: string | pg.QueryConfig): Promise<ExecuteResult<pg.QueryResult>> {
    return execute(
        async (client: pg.PoolClient) => client.query(query),
        pool
    );
}

const forceCloseConnection = () => pool.end();

async function execute<T>(callback: ClientCallback<T>, pool: pg.Pool): Promise<ExecuteResult<T>> {
    let client;
    let data;

    let time = Date.now();
    let connectionTime = Infinity;
    let executeTime = Infinity;

    try {
        client = await pool.connect();
        connectionTime = Date.now() - time;
        time = Date.now();
        data = await callback(client);
        executeTime = Date.now() - time;
    } finally {
        if (client) {
            client.release();
        }
    }

    return {
        data,
        connectionTime,
        executeTime
    };
}

export {
    executeInTransaction,
    executeReadQuery,
    forceCloseConnection
};
