import {AxiosResponse, AxiosError} from 'axios';
import {observable, action, runInAction} from 'mobx';
import {PageStatus, NEW_ID} from 'common/types';
import {getRequest, postRequest} from 'admin/libs/request';

export class OrderItemPageModel {
    @observable public status = PageStatus.LOADING;
    @observable public isNewOrderItem = true;
    @observable public data: any = {};
    @observable public dbConsts: any = {};

    @action public fetchData(id: string): Promise<void> {
        this.isNewOrderItem = id === NEW_ID;

        return new Promise((resolve, reject) => {
            runInAction(() => {
                this.status = PageStatus.LOADING;

                Promise.all([
                    this.isNewOrderItem ?
                        Promise.resolve({data: {}} as any) :
                        getRequest(`/api/v1/order_item/${id}/get`),
                    getRequest('/api/v1/public/get_consts')
                ])
                .then(([response, constResponse]: [AxiosResponse<any>, AxiosResponse<any>]) => {
                    this.data = response.data;
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

    @action public updateOrderItem(values: any, orderId?: string): Promise<AxiosResponse> {
        const data = {
            good_id: values.goodId,
            serial_number: values.serialNumber || null
        };

        if (this.isNewOrderItem) {
            return new Promise((resolve, reject) => {
                runInAction(() => {
                    this.status = PageStatus.LOADING;

                    postRequest(`/api/v1/order_item/create`, {
                        ...data,
                        order_id: orderId
                    })
                        .then(resolve)
                        .catch(reject)
                        .finally(() => this.status = PageStatus.DONE);
                });
            });
        }

        return new Promise((resolve, reject) => {
            runInAction(() => {
                this.status = PageStatus.LOADING;

                const id = this.data.id;

                postRequest(`/api/v1/order_item/${id}/update`, data)
                    .then(resolve)
                    .catch(reject)
                    .finally(() => this.status = PageStatus.DONE);
            });
        });
    }
}
