import * as faker from 'faker';

import {app} from '../../../app/app';
import {TestServer} from '../test-server';
import {consts} from '../../../app/consts';
import {
    getGoods,
    getOrderById,
    getOrderItems
} from '../helpers';

describe('/v1/public', () => {
    let testServer: TestServer;

    beforeAll(async () => {
        testServer = await TestServer.start(app);
    });

    afterAll(async () => testServer.stop());

    describe('GET /get_good_list', () => {
        it('should return only "public" branch', async () => {
            const response = await testServer.request('/v1/public/get_good_list', {json: true});
            expect(response.statusCode).toBe(200);

            const {data} = response.body;
            expect(data.length).toBeGreaterThan(0);
            expect(data.every((item: any) => item.branch === consts.BRANCH.public)).toBe(true);
        });
    });

    describe('GET /get_good/:id', () => {
        it('should return success with status code 200', async () => {
            const allResponse = await testServer.request('/v1/public/get_good_list', {json: true});
            const goodCheck = allResponse.body.data[0];

            const goodResponse = await testServer.request(`/v1/public/get_good/${goodCheck.id}`, {json: true});
            expect(goodResponse.statusCode).toBe(200);
            expect(goodResponse.body).toEqual(goodCheck);
        });

        it('should return error with status code 404', async () => {
            const response = await testServer.request('/v1/public/get_good/9999999', {json: true});
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(consts.API_ERROR_CODE.GOOD_NOT_EXIST);
        });
    });

    describe('POST /create_order', () => {
        it('should return success with status code 200', async () => {
            const goodsResponse = await getGoods(testServer);
            const goods = goodsResponse.body.data.slice(0, 5);
            const goodIds = goods.map((good: any) => good.id);
            const body = {
                customer_name: faker.name.findName(),
                customer_phone: faker.phone.phoneNumberFormat(),
                good_ids: goodIds
            };

            const response = await testServer.request('/v1/public/create_order', {
                json: true,
                method: 'POST',
                body
            });
            expect(response.statusCode).toBe(200);

            const {orderId} = response.body;
            expect(orderId).not.toBeUndefined();

            const orderResponse = await getOrderById(testServer, orderId);
            expect(orderResponse.statusCode).toBe(200);

            const orderItemsResponse = await getOrderItems(testServer, orderId);
            expect(orderItemsResponse.statusCode).toBe(200);

            expect(goodIds.sort()).toEqual(orderItemsResponse.body.map((item: any) => item.goodId).sort());
        });
    });
});
