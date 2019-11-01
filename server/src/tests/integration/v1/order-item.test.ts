import {app} from '../../../app/app';
import {consts} from '../../../app/consts';
import {TestServer} from '../test-server';
import {
    getRandomOrder,
    getRandomGood,
    getOrderItems,
    getOrderItemById,
    updateOrderItem,
    createOrderItem
} from '../helpers';

describe('/v1/order_item', () => {
    let testServer: TestServer;

    beforeAll(async () => {
        testServer = await TestServer.start(app);
    });

    afterAll(async () => testServer.stop());

    describe('GET /:orderId/get_list', () => {
        it('should return success with status code 200', async () => {
            const order = await getRandomOrder(testServer);

            const response = await getOrderItems(testServer, order.id);
            expect(response.statusCode).toBe(200);

            const orderItems = response.body;
            expect(orderItems.length).toBeGreaterThan(0);
        });

        it('should return error if orderId doesn\'t exist with status code 400', async () => {
            const response = await getOrderItems(testServer, '999999');
            expect(response.statusCode).toBe(400);
        });
    });

    describe('GET /:id/get', () => {
        it('should return success with status code 200', async () => {
            const order = await getRandomOrder(testServer);

            const orderItemsResponse = await getOrderItems(testServer, order.id);
            const [orderItem] = orderItemsResponse.body;

            const orderItemResponse = await getOrderItemById(testServer, orderItem.id);
            expect(orderItemResponse.statusCode).toBe(200);
            expect(orderItem).toEqual(orderItemResponse.body);
        });

        it('should return error with status code 404', async () => {
            const response = await getOrderItemById(testServer, '99999');
            expect(response.statusCode).toBe(404);
        });
    });

    describe('POST /create', () => {
        it('should return success with status code 200', async () => {
            const order = await getRandomOrder(testServer);
            const good = await getRandomGood(testServer);

            const orderItemsBeforeResponse = await getOrderItems(testServer, order.id);
            const createOrderItemResponse = await createOrderItem(testServer, {
                order_id: order.id,
                good_id: good.id
            });
            expect(createOrderItemResponse.statusCode).toBe(200);

            const orderItemsAfterResponse = await getOrderItems(testServer, order.id);
            expect(orderItemsBeforeResponse.body.length + 1).toEqual(orderItemsAfterResponse.body.length);
        });

        it('should return error if some field doesn\'t exist with status code 400', async () => {
            const order = await getRandomOrder(testServer);
            const createWithoutGoodIdResponse = await createOrderItem(testServer, {order_id: order.id});
            expect(createWithoutGoodIdResponse.statusCode).toBe(400);

            const good = await getRandomGood(testServer);
            const createWithoutOrderIdResponse = await createOrderItem(testServer, {good_id: good.id});
            expect(createWithoutOrderIdResponse.statusCode).toBe(400);
        });
    });

    describe('POST /:id/update', () => {
        it('should return success with status code 200', async () => {
            const order = await getRandomOrder(testServer);
            const good = await getRandomGood(testServer);

            const orderItemsResponse = await getOrderItems(testServer, order.id);
            const [orderItem] = orderItemsResponse.body;

            const NEW_SERIAL_NUMBER = 'NEW_SERIAL_NUMBER';

            const updateResponse = await updateOrderItem(testServer, orderItem.id, {
                good_id: good.id,
                serial_number: NEW_SERIAL_NUMBER
            });
            expect(updateResponse.statusCode).toBe(200);

            const orderItemResponse = await getOrderItemById(testServer, orderItem.id);
            expect(orderItemResponse.body.goodId).toEqual(good.id);
            expect(orderItemResponse.body.serialNumber).toEqual(NEW_SERIAL_NUMBER);
        });

        it('should return error if "serial_number" not unique with status code 400', async () => {
            const order = await getRandomOrder(testServer);
            const orderItemsResponse = await getOrderItems(testServer, order.id);
            const [orderItem1, orderItem2] = orderItemsResponse.body;

            const UNIQUE_SERIAL_NUMBER = 'UNIQUE_SERIAL_NUMBER';

            const updateSuccessResponse = await updateOrderItem(testServer, orderItem1.id, {
                serial_number: UNIQUE_SERIAL_NUMBER
            });
            expect(updateSuccessResponse.statusCode).toBe(200);

            const updateErrorResponse = await updateOrderItem(testServer, orderItem2.id, {
                serial_number: UNIQUE_SERIAL_NUMBER
            });
            expect(updateErrorResponse.statusCode).toBe(400);
            expect(updateErrorResponse.body.message).toBe(consts.API_ERROR_CODE.ORDER_ITEM_UNIQUE_SERIAL_NUMBER);
        });

        it('should return error if some field doesn\'t exist with status code 400', async () => {
            const order = await getRandomOrder(testServer);
            const orderItemsResponse = await getOrderItems(testServer, order.id);
            const [orderItem] = orderItemsResponse.body;

            const updateWithGoodIdResponse = await updateOrderItem(testServer, orderItem.id, {
                good_id: null
            });
            expect(updateWithGoodIdResponse.statusCode).toBe(400);

            const updateWithOrderIdResponse = await updateOrderItem(testServer, orderItem.id, {
                order_id: null
            });
            expect(updateWithOrderIdResponse.statusCode).toBe(400);

            const updateWithSerialNumberResponse = await updateOrderItem(testServer, orderItem.id, {
                serial_number: null
            });
            expect(updateWithSerialNumberResponse.statusCode).toBe(200);
        });
    });
});
