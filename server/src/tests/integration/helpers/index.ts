import * as faker from 'faker';
import * as got from 'got';

import {TestServer} from '../test-server';

export async function getRandomOrder(testServer: TestServer): Promise<any> {
    const response = await testServer.request('/v1/order/get_list_opened', {json: true});
    const {data: orders} = response.body;
    return faker.random.arrayElement(orders);
}

export async function getRandomGood(testServer: TestServer): Promise<any> {
    const response = await testServer.request('/v1/good/get_list', {json: true});
    const {data: goods} = response.body;
    return faker.random.arrayElement(goods);
}

export async function getRandomOrderItem(testServer: TestServer, orderId: string): Promise<any> {
    const response = await testServer.request(
        `/v1/order_item/${orderId}/get_list`,
        {json: true}
    );
    const orderItems = response.body;
    return faker.random.arrayElement(orderItems);
}

export async function getGoods(testServer: TestServer, query = {}): Promise<got.Response<any>> {
    return testServer.request('/v1/good/get_list', {json: true, query});
}

export async function getGoodById(testServer: TestServer, goodId: string): Promise<got.Response<any>> {
    return testServer.request(`/v1/good/${goodId}/get`, {json: true});
}

export async function getOpenedOrders(testServer: TestServer, query = {}): Promise<got.Response<any>> {
    return testServer.request('/v1/order/get_list_opened', {json: true, query});
}

export async function getOrderById(testServer: TestServer, orderId: string): Promise<got.Response<any>> {
    return testServer.request(`/v1/order/${orderId}/get`, {json: true});
}

export async function getOrderItems(testServer: TestServer, orderId: string): Promise<got.Response<any>> {
    return testServer.request(
        `/v1/order_item/${orderId}/get_list`,
        {json: true}
    );
}

export async function getOrderItemById(testServer: TestServer, orderItemId: string): Promise<got.Response<any>> {
    return testServer.request(
        `/v1/order_item/${orderItemId}/get`,
        {json: true}
    );
}

export async function updateOrderItem(
    testServer: TestServer,
    orderItemId: string,
    body: any
): Promise<got.Response<any>> {
    return testServer.request(
        `/v1/order_item/${orderItemId}/update`,
        {
            json: true,
            method: 'POST',
            body
        }
    );
}

export async function createOrderItem(testServer: TestServer, body: any): Promise<got.Response<any>> {
    return testServer.request(
        '/v1/order_item/create',
        {
            json: true,
            method: 'POST',
            body
        }
    );
}

export async function createOrder(testServer: TestServer, body: any): Promise<got.Response<any>> {
    return testServer.request(
        '/v1/order/create',
        {
            json: true,
            method: 'POST',
            body
        }
    );
}

export async function createGood(testServer: TestServer, body: any): Promise<got.Response<any>> {
    return testServer.request(
        '/v1/good/create',
        {
            json: true,
            method: 'POST',
            body
        }
    );
}
