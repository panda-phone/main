interface Consts {
    TABLE: {
        admin: string;
        good: string;
        order: string;
        orderItem: string;
    };
    BRANCH: {
        draft: string;
        public: string;
        archive: string;
    };
    SORT_ORDER: {
        rand: string;
        asc: string;
        desc: string;
    };
    POSTGRESQL_ERROR_CODE: Record<string, string>;
    API_ERROR_CODE: {
        GOOD_USED_IN_ORDER: string;
        EMPTY_SERIAL_NUMBER: string;
        GOOD_NOT_EXIST: string;
        ORDER_NOT_EXIST: string;
        ORDER_ITEM_NOT_EXIST: string;
        ORDER_ITEM_UNIQUE_SERIAL_NUMBER: string;
    };
    ORDER_STATUS: {
        resolve: string;
        reject: string;
    };
    GOOD_CATEGORY: Record<string, string>;
    GOOD_SUBCATEGORY: {
        iphone: string;
        airpods: string;
    };
    GOOD_BRAND: Record<string, string>;
    GOOD_IPHONE_MODEL: Record<string, string>;
    GOOD_AIRPODS_MODEL: Record<string, string>;
    GOOD_IPHONE_COLOR: Record<string, string>;
    GOOD_AIRPODS_COLOR: Record<string, string>;
    GOOD_IPHONE_MEMORY: Record<string, string>;
    MAX_LOAD_FOR_PAGE: number;
}

export const consts: Consts = {
    TABLE: {
        admin: 'admin',
        good: 'good',
        order: 'order',
        orderItem: 'order_item'
    },
    BRANCH: {
        draft: 'draft',
        public: 'public',
        archive: 'archive'
    },
    SORT_ORDER: {
        rand: 'RAND',
        asc: 'ASC',
        desc: 'DESC'
    },
    MAX_LOAD_FOR_PAGE: 20,
    // https://www.postgresql.org/docs/10/static/errcodes-appendix.html
    POSTGRESQL_ERROR_CODE: {},
    API_ERROR_CODE: {
        GOOD_USED_IN_ORDER: 'GOOD_USED_IN_ORDER',
        EMPTY_SERIAL_NUMBER: 'EMPTY_SERIAL_NUMBER',
        GOOD_NOT_EXIST: 'GOOD_NOT_EXIST',
        ORDER_NOT_EXIST: 'ORDER_NOT_EXIST',
        ORDER_ITEM_NOT_EXIST: 'ORDER_ITEM_NOT_EXIST',
        ORDER_ITEM_UNIQUE_SERIAL_NUMBER: 'ORDER_ITEM_UNIQUE_SERIAL_NUMBER'
    },
    ORDER_STATUS: {
        resolve: 'resolve',
        reject: 'reject'
    },
    GOOD_CATEGORY: {
        mobile: 'mobile',
        headphone: 'headphone'
    },
    GOOD_SUBCATEGORY: {
        iphone: 'iphone',
        airpods: 'airpods'
    },
    GOOD_BRAND: {
        apple: 'apple'
    },
    GOOD_IPHONE_MODEL: {
        '11proMax': '11_pro_max',
        '11pro': '11_pro',
        '11base': '11',
        xsMax: 'xs_max',
        xs: 'xs',
        xr: 'xr',
        x: 'x',
        '8plus': '8_plus',
        '8base': '8',
        '7plus': '7_plus',
        '7base': '7',
        '6s': '6s',
        se: 'se'
    },
    GOOD_AIRPODS_MODEL: {
        series1: 'series_1',
        series2: 'series_2'
    },
    GOOD_IPHONE_COLOR: {
        silver: 'silver',
        gold: 'gold',
        white: 'white',
        yellow: 'yellow',
        coral: 'coral',
        blue: 'blue',
        black: 'black',
        red: 'red',
        roseGold: 'rose_gold',
        spaceGray: 'space_gray',
        productRed: 'product_red',
        blackMatte: 'black_matte',
        blackjet: 'black_jet'
    },
    GOOD_AIRPODS_COLOR: {
        white: 'white'
    },
    GOOD_IPHONE_MEMORY: {
        '8gb': '8gb',
        '16gb': '16gb',
        '32gb': '32gb',
        '64gb': '64gb',
        '128gb': '128gb',
        '256gb': '256gb',
        '512gb': '512gb',
        '1024gb': '1024gb'
    }
};

export function getValues(keys: keyof Consts | (keyof Consts)[]) {
    if (Array.isArray(keys)) {
        const result: any[] = [];
        keys.forEach((key) => result.push(...Object.values(consts[key])));
        return result;
    }

    return Object.values(consts[keys]);
}

// export const locale = {
//     BRANCH: {
//         draft: 'Черновик',
//         public: 'Публичный',
//         archive: 'Архив'
//     },
//     API_ERROR_CODE: {
//         GOOD_USED_IN_ORDER: 'Товар используется в заказе',
//         EMPTY_SERIAL_NUMBER: 'Элементы заказа содержат не заполненный серийный номер',
//         GOOD_NOT_EXIST: 'Товар не найден',
//         ORDER_NOT_EXIST: 'Заказ не найден',
//         ORDER_ITEM_NOT_EXIST: 'Элемент заказа не найден',
//         ORDER_ITEM_UNIQUE_SERIAL_NUMBER: 'Серийный номер уже существует'
//     },
//     GOOD_CATEGORY: {
//         mobile: 'Телефоны',
//         headphone: 'Наушники'
//     },
//     GOOD_SUBCATEGORY: {
//         iphone: 'iPhone',
//         airpods: 'AirPods'
//     },
//     GOOD_BRAND: {
//         apple: 'Apple'
//     },
//     GOOD_IPHONE_MODEL: {
//         '11_pro_max': '11 Pro Max',
//         '11_pro': '11 Pro',
//         '11': '11', // tslint:disable-line
//         xs_max: 'XS Max',
//         xs: 'XS',
//         xr: 'XR',
//         x: 'X',
//         '8_plus': '8 Plus',
//         '8': '8', // tslint:disable-line
//         '7_plus': '7 Plus',
//         '7': '7', // tslint:disable-line
//         '6s': '6S',
//         se: 'SE'
//     },
//     GOOD_AIRPODS_MODEL: {
//         series_1: 'Серия 1',
//         series_2: 'Серия 2'
//     },
//     GOOD_IPHONE_COLOR: {
//         silver: 'Серебряный',
//         gold: 'Золотой',
//         white: 'Белый',
//         yellow: 'Желтый',
//         coral: 'Коралловый',
//         blue: 'Синий',
//         black: 'Черный',
//         red: 'Красный',
//         rose_gold: 'Розовое золото',
//         space_gray: 'Серый космос',
//         product_red: 'PRODUCT(RED)',
//         black_matte: 'Черный матовый',
//         black_jet: 'Черный оникс'
//     },
//     GOOD_AIRPODS_COLOR: {
//         white: 'Белый'
//     },
//     GOOD_IPHONE_MEMORY: {
//         '8gb': '8 GB',
//         '16gb': '16 GB',
//         '32gb': '32 GB',
//         '64gb': '64 GB',
//         '128gb': '128 GB',
//         '256gb': '256 GB',
//         '512gb': '512 GB',
//         '1024gb': '1024 GB'
//     }
// };
