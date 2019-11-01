import * as faker from 'faker';
import * as got from 'got';

import {app} from '../../../app/app';
import {consts} from '../../../app/consts';
import {TestServer} from '../test-server';
import {
    getOpenedOrders,
    getRandomOrder,
    getOrderById,
    getOrderItems,
    updateOrderItem,
    createOrder
} from '../helpers';

async function updateOrder(testServer: TestServer, orderId: string, body: any): Promise<got.Response<any>> {
    return testServer.request(
        `/v1/order/${orderId}/update`,
        {
            json: true,
            method: 'POST',
            body
        }
    );
}

async function resolveOrder(testServer: TestServer, orderId: string): Promise<got.Response<any>> {
    return testServer.request(`/v1/order/${orderId}/resolve`, {
        json: true,
        method: 'POST'
    });
}

async function rejectOrder(testServer: TestServer, orderId: string): Promise<got.Response<any>> {
    return testServer.request(`/v1/order/${orderId}/reject`, {
        json: true,
        method: 'POST'
    });
}

describe('/v1/order', () => {
    let testServer: TestServer;

    beforeAll(async () => {
        testServer = await TestServer.start(app);
    });

    afterAll(async () => testServer.stop());

    describe('GET /get_list_opened', () => {
        it('should return success with status code 200', async () => {
            const response = await getOpenedOrders(testServer);
            expect(response.statusCode).toBe(200);

            const {meta, data} = response.body;
            expect(meta).not.toBeUndefined();
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
        });

        it('should return only opened orders', async () => {
            const response = await getOpenedOrders(testServer);
            expect(response.body.data.every((item: any) => item.resolutionStatus === null)).toBe(true);
        });

        it('should return limited data', async () => {
            const offset = 4;
            const limit = 9;

            const response = await getOpenedOrders(testServer, {limit, offset});
            expect(response.statusCode).toBe(200);

            const {meta, data} = response.body;
            expect(data.length).toEqual(limit);
            expect(meta.offset).toBe(offset);
            expect(meta.limit).toBe(limit);

            const responseWithoutOffset = await getOpenedOrders(testServer);
            expect(responseWithoutOffset.statusCode).toBe(200);

            expect(data[0]).not.toEqual(responseWithoutOffset.body.data[0]);
        });

        it('should return "desc" ordered data', async () => {
            const response = await getOpenedOrders(testServer, {order: 'DESC'});
            expect(response.statusCode).toBe(200);

            const {data} = response.body;
            for (let i = 0; i < data.length - 1; i++) {
                const date1 = new Date(Date.parse(data[i].created));
                const date2 = new Date(Date.parse(data[i + 1].created));
                expect(date1 > date2).toBe(true);
            }
        });
    });

    describe('GET /:id/get', () => {
        it('should return success with status code 200', async () => {
            const orderCheck = await getRandomOrder(testServer);
            const orderResponse = await getOrderById(testServer, orderCheck.id);
            expect(orderResponse.statusCode).toBe(200);
            expect(orderResponse.body).toEqual(orderCheck);
        });

        it('should return error with status code 404', async () => {
            const response = await getOrderById(testServer, '9999999');
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(consts.API_ERROR_CODE.ORDER_NOT_EXIST);
        });
    });

    describe('POST /create', () => {
        it('should return success with status code 200', async () => {
            const orderCheck = await getRandomOrder(testServer);
            delete orderCheck.id;
            delete orderCheck.created;
            delete orderCheck.resolutionStatus;
            delete orderCheck.resolutionDate;

            const createResponse = await createOrder(testServer, {
                called: orderCheck.called,
                customer_name: orderCheck.customerName,
                customer_phone: orderCheck.customerPhone,
                delivery_address: orderCheck.deliveryAddress,
                delivery_date: orderCheck.deliveryDate
            });
            expect(createResponse.statusCode).toBe(200);

            const orderResponse = await getOrderById(testServer, createResponse.body.id);
            const createdOrder = orderResponse.body;

            orderCheck.id = createdOrder.id;
            orderCheck.created = createdOrder.created;
            orderCheck.resolutionDate = createdOrder.resolutionDate;
            orderCheck.resolutionStatus = createdOrder.resolutionStatus;
            expect(createdOrder).toEqual(orderCheck);
        });

        it('should return error if some field doesn\'t exist with status code 400', async () => {
            const orderCheck = await getRandomOrder(testServer);

            const responseWithoutCustomerPhone = await createOrder(testServer, {
                customer_name: orderCheck.customerName
            });
            expect(responseWithoutCustomerPhone.statusCode).toBe(400);

            const responseWithoutCustomerName = await createOrder(testServer, {
                customer_phone: orderCheck.customerPhone
            });
            expect(responseWithoutCustomerName.statusCode).toBe(400);
        });
    });

    describe('POST /:id/update', () => {
        it('should return success with status code 200', async () => {
            const orderCheck = await getRandomOrder(testServer);
            const customerNameNewValue = 'CUSTOMER NEW VALUE';

            const response = await updateOrder(testServer, orderCheck.id, {
                customer_name: customerNameNewValue
            });
            expect(response.statusCode).toBe(200);

            const orderResponse = await getOrderById(testServer, orderCheck.id);
            expect(orderResponse.statusCode).toBe(200);
            expect(orderResponse.body.customerName).toBe(customerNameNewValue);
        });

        it('should return error if some field doesn\'t exist with status code 400', async () => {
            const orderCheck = await getRandomOrder(testServer);

            const withCustomerNameResponse = await updateOrder(testServer, orderCheck.id, {
                customer_name: null
            });
            expect(withCustomerNameResponse.statusCode).toBe(400);

            const withCustomerPhoneResponse = await updateOrder(testServer, orderCheck.id, {
                customer_phone: null
            });
            expect(withCustomerPhoneResponse.statusCode).toBe(400);

            const withCalledResponse = await updateOrder(testServer, orderCheck.id, {
                called: null
            });
            expect(withCalledResponse.statusCode).toBe(400);
        });
    });

    describe('POST /resolve', () => {
        it('should return success with status code 200', async () => {
            const order = await getRandomOrder(testServer);
            const orderItemsResponse = await getOrderItems(testServer, order.id);
            const orderItems = orderItemsResponse.body;

            const orderItemsWithoutSerial = orderItems.filter((item: any) => item.serialNumber === null);
            for (let i = 0; i < orderItemsWithoutSerial.length; i++) {
                const orderItem = orderItemsWithoutSerial[i];
                const updateOrderItemResponse = await updateOrderItem(testServer, orderItem.id, {
                    serial_number: `${faker.random.number()}-${faker.address.zipCode()}`
                });
                expect(updateOrderItemResponse.statusCode).toBe(200);
            }

            const resolveResponse = await resolveOrder(testServer, order.id);
            expect(resolveResponse.statusCode).toBe(200);

            const orderResponse = await getOrderById(testServer, order.id);
            expect(orderResponse.statusCode).toBe(200);

            expect(orderResponse.body.resolutionStatus).toBe(consts.ORDER_STATUS.resolve);
            expect(orderResponse.body.resolutionDate).not.toBe(null);
        });

        it('should return error with status code 400', async () => {
            async function findOrder() {
                const ordersResponse = await getOpenedOrders(testServer);
                const {data: orders} = ordersResponse.body;

                for (let i = 0; i < orders.length; i++) {
                    const order = orders[i];
                    const orderItemsResponse = await getOrderItems(testServer, order.id);
                    const orderItemWithoutSerial = orderItemsResponse.body
                        .find((item: any) => item.serialNumber === null);
                    if (orderItemWithoutSerial) {
                        return order;
                    }
                }
            }

            const order = await findOrder();
            expect(order).not.toBeUndefined();

            const resolveResponse = await resolveOrder(testServer, order.id);
            expect(resolveResponse.statusCode).toBe(400);
            expect(resolveResponse.body.message).toBe(consts.API_ERROR_CODE.EMPTY_SERIAL_NUMBER);
        });
    });

    describe('POST /reject', () => {
        it('should return success with status code 200', async () => {
            const order = await getRandomOrder(testServer);
            const resolveResponse = await rejectOrder(testServer, order.id);
            expect(resolveResponse.statusCode).toBe(200);

            const orderResponse = await getOrderById(testServer, order.id);
            expect(orderResponse.statusCode).toBe(200);
            expect(orderResponse.body.resolutionStatus).toBe(consts.ORDER_STATUS.reject);
            expect(orderResponse.body.resolutionDate).not.toBe(null);
        });
    });
});
