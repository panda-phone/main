import {ClientDataModel} from 'admin/models/client-data';
import {GoodsPageModel} from 'admin/models/goods';
import {GoodPageModel} from 'admin/models/good';
import {OrdersPageModel} from 'admin/models/orders';
import {OrderPageModel} from 'admin/models/order';
import {OrderItemPageModel} from 'admin/models/order-item';

export const clientDataModel = new ClientDataModel();
export const goodsPageModel = new GoodsPageModel();
export const goodPageModel = new GoodPageModel();
export const ordersPageModel = new OrdersPageModel();
export const orderPageModel = new OrderPageModel();
export const orderItemPageModel = new OrderItemPageModel();
