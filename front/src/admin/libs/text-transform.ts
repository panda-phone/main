import {PhoneNumberFormat as PNF, PhoneNumberUtil} from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export function transformNumber(value: string): string {
    return value.replace(/[^\+0-9]/gim, '');
}

export function transformPhone(value: string): string {
    let result = value.replace(/[^\+0-9]/gim, '');
    if (result.length <= 1 && result !== '+') {
        return `+${result}`;
    }

    try {
        const number = phoneUtil.parse(result, 'RU');
        result = phoneUtil.format(number, PNF.INTERNATIONAL);
        // tslint:disable-next-line
    } catch (_) {}

    return result;
}
