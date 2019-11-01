import {AxiosResponse} from 'axios';
import {observable, action, runInAction} from 'mobx';
import {PageStatus} from 'common/types';
import {getRequest} from 'admin/libs/request';
import {locale} from 'admin/libs/locale';
import {TableSchema} from 'admin/components/data-table';
import {CheckBoxItem} from 'admin/components/check-box';

interface PagePagination {
    limit: number;
    offset: number;
    total: number;
}

interface FilterItem {
    selected: string[];
    items: CheckBoxItem[];
}

const INIT_PAGINATION: PagePagination = {
    limit: 50,
    offset: 0,
    total: 50
};

export class OrdersPageModel {
    @observable public status = PageStatus.LOADING;
    @observable public pagination = INIT_PAGINATION;
    @observable public data: any[] = [];
    @observable public dbConsts: any = {};

    @action public fetchData(resetPagination = false): Promise<any> {
        if (resetPagination) {
            this.pagination = INIT_PAGINATION;
        }

        return new Promise((resolve, reject) => {
            runInAction(() => {
                this.status = PageStatus.LOADING;
                const params = [
                    `limit=${this.pagination.limit}`,
                    `offset=${this.pagination.offset}`,
                    'order=DESC'
                ];

                Promise.all([
                    getRequest(`/api/v1/order/get_list_opened?${params.join('&')}`),
                    getRequest('/api/v1/public/get_consts')
                ])
                .then(([response, constResponse]: [AxiosResponse<any>, AxiosResponse<any>]) => {
                    const {data: {meta, data}} = response;
                    this.pagination.total = meta.total;
                    this.data = data;
                    this.dbConsts = constResponse.data;
                    resolve();
                })
                .catch(reject)
                .finally(() => this.status = PageStatus.DONE);
            });
        });
    }
}

export const ORDERS_TABLE_SCHEMA: TableSchema<any>[] = [
    {
        key: 'id',
        title: locale['orderItem.field.id'],
        linkTemplate: '/bender-root/order/:value'
    },
    {
        key: 'customerName',
        title: locale['orderItem.field.customerName']
    },
    {
        key: 'customerPhone',
        title: locale['orderItem.field.customerPhone']
    },
    {
        key: 'called',
        title: locale['orderItem.field.called'],
        type: 'boolean'
    },
    {
        key: 'deliveryDate',
        title: locale['orderItem.field.deliveryDate']
    },
    {
        key: 'deliveryAddress',
        title: locale['orderItem.field.deliveryAddress']
    },
    {
        key: 'created',
        title: locale['orderItem.field.created']
    }
];
