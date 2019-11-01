import {AxiosResponse, AxiosError} from 'axios';
import * as moment from 'moment';
import {observable, action, runInAction} from 'mobx';

import {PageStatus, NEW_ID} from 'common/types';
import {getRequest, postRequest} from 'admin/libs/request';
import {TableSchema} from 'admin/components/data-table';
import {locale} from 'admin/libs/locale';

export class OrderPageModel {
    @observable public status = PageStatus.LOADING;
    @observable public isNewOrder = true;
    @observable public orderData: any = {};
    @observable public orderItems: any[] = [];
    @observable public dbConsts: any = {};

    @action public fetchData(id: string): Promise<void> {
        this.isNewOrder = id === NEW_ID;

        return new Promise((resolve, reject) => {
            runInAction(() => {
                this.status = PageStatus.LOADING;

                Promise.all([
                    this.isNewOrder ?
                        Promise.resolve({data: {}} as any) :
                        getRequest(`/api/v1/order/${id}/get`),
                    this.isNewOrder ?
                        Promise.resolve({data: []} as any) :
                        getRequest(`/api/v1/order_item/${id}/get_list`),
                    getRequest('/api/v1/public/get_consts')
                ])
                .then(([
                    orderResponse,
                    orderItemsResponse,
                    constResponse
                ]: [AxiosResponse<any>, AxiosResponse<any>, AxiosResponse<any>]) => {
                    this.orderData = prepareOrder(orderResponse.data);
                    this.orderItems = orderItemsResponse.data;
                    this.dbConsts = constResponse.data;
                    this.status = PageStatus.DONE;
                    resolve();
                })
                .catch((error: AxiosError) => {
                    this.status = PageStatus.FAIL;
                    reject(error);
                });
            });
        });
    }

    @action public updateOrder(values: any): Promise<AxiosResponse> {
        const data = {
            id: values.id,
            customer_name: values.customerName,
            customer_phone: values.customerPhone,
            delivery_address: values.deliveryAddress || null,
            delivery_date: values.deliveryDate || null,
            called: values.called
        };

        this.status = PageStatus.LOADING;

        if (this.isNewOrder) {
            return new Promise((resolve, reject) => {
                runInAction(() => {
                    postRequest(`/api/v1/order/create`, data)
                        .then(resolve)
                        .catch(reject)
                        .finally(() => this.status = PageStatus.DONE);
                });
            });
        }

        return new Promise((resolve, reject) => {
            runInAction(() => {
                const id = data.id;
                delete data.id;

                postRequest(`/api/v1/order/${id}/update`, data)
                    .then(resolve)
                    .catch(reject)
                    .finally(() => this.status = PageStatus.DONE);
            });
        });
    }

    @action public setOrderResolution(id: string, status: 'resolve' | 'reject'): Promise<any> {
        this.status = PageStatus.LOADING;

        return new Promise((resolve, reject) => {
            runInAction(() => {
                postRequest(`/api/v1/order/${id}/${status}`, {})
                    .then(resolve)
                    .catch(reject)
                    .finally(() => this.status = PageStatus.DONE);
            });
        });
    }

    @action public deleteOrderItem(id: string): Promise<any> {
        this.status = PageStatus.LOADING;

        return new Promise((resolve, reject) => {
            runInAction(() => {
                postRequest(`/api/v1/order_item/${id}/delete`, {})
                    .then(resolve)
                    .catch(reject)
                    .finally(() => this.status = PageStatus.DONE);
            });
        });
    }
}

export const ORDER_ITEM_TABLE_SCHEMA: TableSchema<any>[] = [
    {
        key: 'id',
        title: locale['goodItem.field.id'],
        linkTemplate: '/bender-root/order/:link.orderId/:value'
    },
    {
        key: 'category',
        title: locale['goodItem.field.category'],
        type: 'category-data'
    },
    {
        key: 'branch',
        title: locale['goodItem.field.branch']
    },
    {
        key: 'original',
        title: locale['goodItem.field.original'],
        type: 'boolean'
    },
    {
        key: 'serialNumber',
        title: locale['orderItem.field.serialNumber']
    },
    {
        key: 'properties',
        title: locale['goodItem.field.properties'],
        type: 'good-properties'
    },
    {
        key: 'price',
        title: locale['goodItem.field.price'],
        type: 'price-object'
    }
];

function prepareOrder(data: any): any {
    if (data.deliveryDate) {
        data.deliveryDate = moment(data.deliveryDate).toDate();
    }

    return data;
}
