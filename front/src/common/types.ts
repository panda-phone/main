export enum PageStatus {
    LOADING = 'loading',
    DONE = 'done',
    FAIL = 'fail'
}

export enum ApiResponse {
    GOOD_NOT_EXIST = 'GOOD_NOT_EXIST',
    ORDER_NOT_EXIST = 'ORDER_NOT_EXIST',
    ORDER_ITEM_NOT_EXIST = 'ORDER_ITEM_NOT_EXIST'
}

export const NEW_ID = 'new';

export interface ComponentChangeEvent<Value> {
    target: {
        value: Value;
        name: string;
    };
}
