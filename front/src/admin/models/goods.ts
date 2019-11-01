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

interface Filter {
    category: FilterItem;
    branch: FilterItem;
    original: FilterItem;
    goodId: string;
}

const INIT_FILTER_SELECT = {
    selected: [],
    items: []
};

const INIT_PAGINATION: PagePagination = {
    limit: 50,
    offset: 0,
    total: 50
};

export class GoodsPageModel {
    @observable public status = PageStatus.LOADING;
    @observable public pagination = INIT_PAGINATION;
    @observable public data: any[] = [];
    @observable public filter: Filter = {
        category: INIT_FILTER_SELECT,
        branch: INIT_FILTER_SELECT,
        original: INIT_FILTER_SELECT,
        goodId: ''
    };

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

                const branchSelected = this.filter.branch.selected;
                params.push(
                    branchSelected.length > 0 ?
                        `branch=${branchSelected.join(',')}` :
                        'branch=public,draft'
                );

                const categorySelected = this.filter.category.selected;
                if (categorySelected.length > 0) {
                    params.push(`category=${categorySelected.join(',')}`);
                }

                const originalSelected = this.filter.original.selected;
                if (originalSelected.length > 0) {
                    params.push(`original=${originalSelected.join(',')}`);
                }

                const goodId = this.filter.goodId;
                if (goodId) {
                    params.push(`id=${goodId}`);
                }

                Promise.all([
                    getRequest(`/api/v1/good/get_list?${params.join('&')}`),
                    getRequest('/api/v1/public/get_consts')
                ])
                .then(([response, constResponse]: [AxiosResponse<any>, AxiosResponse<any>]) => {
                    const {data: {meta, data}} = response;
                    this.pagination.total = meta.total;
                    this.data = data;
                    this.initFilter(constResponse.data);
                    resolve();
                })
                .catch(reject)
                .finally(() => this.status = PageStatus.DONE);
            });
        });
    }

    private initFilter(dbConsts: any): void {
        this.filter.branch.items = Object.entries<string>(dbConsts.BRANCH)
            .filter(([key]) => key !== 'archive')
            .map(([key, value]) => ({key, value}));

        this.filter.category.items = Object.entries<string>(dbConsts.GOOD_CATEGORY)
            .map(([key, value]) => ({key, value}));

        this.filter.original.items = ['true', 'false'].map((value) => ({key: value, value}));
    }
}

export const GOODS_TABLE_SCHEMA: TableSchema<any>[] = [
    {
        key: 'id',
        title: locale['goodItem.field.id'],
        linkTemplate: '/bender-root/good/:value'
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
