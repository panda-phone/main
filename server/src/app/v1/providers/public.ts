import {executeInTransaction} from 'app/lib/db-client';
import {createOrder} from 'app/v1/providers/order';
import {createOrderItems} from 'app/v1/providers/order-item';

export async function createCustomerOrder(body: any) {
    const {customer_name, customer_phone, good_ids: goodIds} = body;

    return executeInTransaction(async (client) => {
        const {id: orderId} = await createOrder(client, {
            customer_name,
            customer_phone
        });

        await createOrderItems(client, orderId, goodIds);

        return orderId;
    });
}
