import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as faker from 'faker';

import {executeReadQuery} from '../../../app/lib/db-client';
import {TestServer} from '../test-server';
import {app} from '../../../app/app';
import {consts} from '../../../app/consts';
import {
    createOrder,
    createOrderItem,
    createGood,
    getGoodById,
    getOrderById
} from './index';

const readFile = util.promisify(fs.readFile);

async function reloadPublicSchema() {
    const sql = await readFile(path.resolve('./server/src/migrations/reload-public-schema.pgsql'), 'utf-8');
    await executeReadQuery(sql);
}

async function makeMigration() {
    const createTablesSql = await readFile(path.resolve('./server/src/migrations/create-tables.pgsql'), 'utf-8');
    await executeReadQuery(createTablesSql);
    const createTriggersSql = await readFile(path.resolve('./server/src/migrations/create-triggers.pgsql'), 'utf-8');
    await executeReadQuery(createTriggersSql);
}

async function fillGood(testServer: TestServer): Promise<any[]> {
    function makeGood() {
        const category = faker.random.objectElement(consts.GOOD_CATEGORY);
        const subcategory = faker.random.objectElement(consts.GOOD_SUBCATEGORY);

        const body: Record<string, any> = {
            category,
            subcategory,
            original: faker.random.boolean(),
            price: faker.finance.amount(5000, 130000),
            discount: faker.finance.amount(0, 100),
            branch: faker.random.objectElement(consts.BRANCH)
        };

        if (subcategory === consts.GOOD_SUBCATEGORY.iphone) {
            body.properties = {
                brand: faker.random.objectElement(consts.GOOD_BRAND),
                iphone: {
                    memory: faker.random.objectElement(consts.GOOD_IPHONE_MEMORY),
                    color: faker.random.objectElement(consts.GOOD_IPHONE_COLOR),
                    model: faker.random.objectElement(consts.GOOD_IPHONE_MODEL)
                }
            };
        } else if (subcategory === consts.GOOD_SUBCATEGORY.airpods) {
            body.properties = {
                brand: faker.random.objectElement(consts.GOOD_BRAND),
                airpods: {
                    wirelessCharging: faker.random.boolean(),
                    color: faker.random.objectElement(consts.GOOD_AIRPODS_COLOR),
                    model: faker.random.objectElement(consts.GOOD_AIRPODS_MODEL)
                }
            };
        }

        return body;
    }

    const goods = [];
    for (let i = 0; i < 1000; i++) {
        const response = await createGood(testServer, makeGood());

        if (response.statusCode !== 200) {
            process.stderr.write(`${JSON.stringify(response.body)}\n`);
        } else {
            const goodResponse = await getGoodById(testServer, response.body.id);
            goods.push(goodResponse.body);
        }
    }

    return goods;
}

async function fillOrder(testServer: TestServer): Promise<any[]> {
    function makeOrder() {
        const body: Record<string, any> = {
            customer_name: faker.name.findName(),
            customer_phone: faker.phone.phoneNumberFormat(),
            called: faker.random.boolean(),
            delivery_address: faker.address.streetAddress(),
            delivery_date: faker.date.future()
        };

        if (faker.random.boolean()) {
            body.resolution_date = faker.date.past();
            body._resolution_status = faker.random.objectElement(consts.ORDER_STATUS);
        }

        return body;
    }

    const orders = [];
    for (let i = 0; i < 100; i++) {
        const response = await createOrder(testServer, makeOrder());

        if (response.statusCode !== 200) {
            process.stderr.write(`${JSON.stringify(response.body)}\n`);
        } else {
            const orderResponse = await getOrderById(testServer, response.body.id);
            orders.push(orderResponse.body);
        }
    }

    return orders;
}

async function fillOrderItem(testServer: TestServer, orders: any[], goods: any[]): Promise<void> {
    function makeOrderItem(orderId?: string) {
        const body: Record<string, any> = {
            good_id: faker.random.arrayElement(goods).id,
            order_id: orderId || faker.random.arrayElement(orders).id,
            serial_number: faker.random.boolean() ? null : `${faker.random.number()}-${faker.address.zipCode()}`
        };

        return body;
    }

    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const response = await createOrderItem(testServer, makeOrderItem(order.id));

        if (response.statusCode !== 200) {
            process.stderr.write(`${JSON.stringify(response.body)}\n`);
        }
    }

    for (let i = 0; i < 500; i++) {
        const response = await createOrderItem(testServer, makeOrderItem());

        if (response.statusCode !== 200) {
            process.stderr.write(`${JSON.stringify(response.body)}\n`);
        }
    }
}

async function run(testServer: TestServer) {
    await reloadPublicSchema();
    await makeMigration();

    process.stdout.write('Start filling "good" table...\n');
    const goods = await fillGood(testServer);
    process.stdout.write('Start filling "order" table...\n');
    const orders = await fillOrder(testServer);
    process.stdout.write('Start filling "order_item" table...\n');
    await fillOrderItem(testServer, orders, goods);
}

(async () => {
    let testServer: TestServer | undefined;
    try {
        testServer = await TestServer.start(app);
        await run(testServer);
    } catch (error) {
        process.stderr.write(error);
    } finally {
        if (testServer) {
            testServer.stop();
        }

        process.exit();
    }
})();
