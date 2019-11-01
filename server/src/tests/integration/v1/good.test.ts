import * as got from 'got';

import {app} from '../../../app/app';
import {TestServer} from '../test-server';
import {getValues, consts} from '../../../app/consts';
import {
    getGoods,
    getGoodById,
    getRandomGood,
    getRandomOrderItem,
    createGood,
    getOpenedOrders
} from '../helpers';

async function updateGood(testServer: TestServer, goodId: string, body: any): Promise<got.Response<any>> {
    return testServer.request(
        `/v1/good/${goodId}/update`,
        {
            json: true,
            method: 'POST',
            body
        }
    );
}

describe('/v1/good', () => {
    let testServer: TestServer;

    beforeAll(async () => {
        testServer = await TestServer.start(app);
    });

    afterAll(async () => testServer.stop());

    async function checkGetFilter(allowValues: any[], queryKey: string) {
        const oneResponse = await getGoods(testServer, {
            [queryKey]: allowValues[0]
        });
        expect(oneResponse.statusCode).toBe(200);
        expect(oneResponse.body.data.every((item: any) => item[queryKey] === allowValues[0])).toBe(true);

        const allResponse = await getGoods(testServer, {
            [queryKey]: allowValues.join(',')
        });
        expect(allResponse.statusCode).toBe(200);
        expect(allResponse.body.data.every((item: any) => allowValues.includes(item[queryKey]))).toBe(true);
    }

    describe('GET /get_list', () => {
        it('should return success with status code 200', async () => {
            const response = await getGoods(testServer);
            expect(response.statusCode).toBe(200);

            const {meta, data} = response.body;
            expect(meta).not.toBeUndefined();
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
        });

        it('should return limited data', async () => {
            const offset = 4;
            const limit = 9;

            const response = await getGoods(testServer, {limit, offset});
            expect(response.statusCode).toBe(200);

            const {meta, data} = response.body;
            expect(data.length).toEqual(limit);
            expect(meta.offset).toBe(offset);
            expect(meta.limit).toBe(limit);

            const responseWithoutOffset = await getGoods(testServer);
            expect(responseWithoutOffset.statusCode).toBe(200);

            expect(data[0]).not.toEqual(responseWithoutOffset.body.data[0]);
        });

        it('should return "desc" ordered data', async () => {
            const response = await getGoods(testServer, {order: 'DESC'});
            expect(response.statusCode).toBe(200);

            const {data} = response.body;
            for (let i = 0; i < data.length - 1; i++) {
                const date1 = new Date(Date.parse(data[i].updated));
                const date2 = new Date(Date.parse(data[i + 1].updated));
                expect(date1 > date2).toBe(true);
            }
        });

        it('should return only filtered "id"', async () => {
            const response = await getGoods(testServer);
            const ids = response.body.data.slice(0, 5).map((item: any) => item.id);
            await checkGetFilter(ids, 'id');

            const filteredResponse = await getGoods(testServer, {id: ids.join(',')});
            expect(filteredResponse.body.data.length).toBe(ids.length);
        });

        it('should return only filtered "category"', async () => {
            const categories = getValues('GOOD_CATEGORY');
            await checkGetFilter(categories, 'category');
        });

        it('should return only filtered "subcategory"', async () => {
            const subcategories = getValues('GOOD_SUBCATEGORY');
            await checkGetFilter(subcategories, 'subcategory');
        });

        it('should return only filtered "original"', async () => {
            await checkGetFilter([true, false], 'original');
        });

        it('should return only filtered "branch"', async () => {
            const branches = getValues(['BRANCH']);
            await checkGetFilter(branches, 'branch');
        });
    });

    describe('GET /:id/get', () => {
        it('should return success with status code 200', async () => {
            const goodCheck = await getRandomGood(testServer);
            const goodResponse = await getGoodById(testServer, goodCheck.id);
            expect(goodResponse.statusCode).toBe(200);
            expect(goodResponse.body).toEqual(goodCheck);
        });

        it('should return error with status code 404', async () => {
            const response = await getGoodById(testServer, '9999999');
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(consts.API_ERROR_CODE.GOOD_NOT_EXIST);
        });
    });

    describe('POST /create', () => {
        it('should return success with status code 200', async () => {
            const goodCheck = await getRandomGood(testServer);
            delete goodCheck.id;
            delete goodCheck.updated;

            const createResponse = await createGood(testServer, goodCheck);
            expect(createResponse.statusCode).toBe(200);

            const {id} = createResponse.body;
            const goodResponse = await getGoodById(testServer, id);
            expect(goodResponse.statusCode).toBe(200);

            const createdGood = goodResponse.body;
            goodCheck.id = createdGood.id;
            goodCheck.updated = createdGood.updated;
            expect(goodResponse.body).toEqual(goodCheck);
        });
    });

    describe('POST /:id/update', () => {
        it('should return success with status code 200', async () => {
            const goodCheck = await getRandomGood(testServer);
            const priceNewValue = 99999;
            const response = await updateGood(testServer, goodCheck.id, {
                price: priceNewValue
            });

            if (response.statusCode === 400) {
                expect(response.body.message).toBe(consts.API_ERROR_CODE.GOOD_USED_IN_ORDER);
                return;
            }

            expect(response.statusCode).toBe(200);

            const goodResponse = await getGoodById(testServer, goodCheck.id);
            expect(goodResponse.statusCode).toBe(200);
            expect(goodResponse.body.price).toBe(priceNewValue);
        });

        it('should update field "updated" in trigger', async () => {
            const getAllResponse = await testServer.request('/v1/good/get_list', {json: true});
            const {data: [checkItem]} = getAllResponse.body;
            const checkUpdated = checkItem.updated;

            const priceNewValue = 99999;
            const response = await testServer.request(`/v1/good/${checkItem.id}/update`, {
                json: true,
                method: 'POST',
                body: {
                    price: priceNewValue
                }
            });

            if (response.statusCode === 400) {
                expect(response.body.message).toBe(consts.API_ERROR_CODE.GOOD_USED_IN_ORDER);
                return;
            }

            expect(response.statusCode).toBe(200);

            const getByIdResponse = await testServer.request(`/v1/good/${checkItem.id}/get`, {json: true});
            expect(getByIdResponse.statusCode).toBe(200);
            expect(getByIdResponse.body.updated).not.toBe(checkUpdated);
        });

        it('should return error if good used in order with status code 400', async () => {
            async function findGood() {
                const ordersResponse = await getOpenedOrders(testServer);
                const {data: orders} = ordersResponse.body;

                for (let i = 0; i < orders.length; i++) {
                    const order = orders[i];
                    const orderItem = await getRandomOrderItem(testServer, order.id);
                    if (orderItem) {
                        const goodResponse = await getGoodById(testServer, orderItem.goodId);
                        return goodResponse.body;
                    }
                }
            }

            const good = await findGood();
            expect(good).not.toBeUndefined();

            const priceNewValue = 99999;
            const response = await updateGood(testServer, good.id, {
                price: priceNewValue
            });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe(consts.API_ERROR_CODE.GOOD_USED_IN_ORDER);
        });
    });
});
