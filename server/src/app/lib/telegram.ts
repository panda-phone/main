import {URL} from 'url';

import {logger} from 'app/lib/logger';
import {doRequest} from 'app/lib/do-request';
import {config} from 'app/config';

const TELEGRAM_API_HOST = `https://api.telegram.org`;

export class Telegram {
    static async sendToWorkChat(text: string, originalUrl: string): Promise<void> {
        const url = new URL(`/bot${config['env.telegramBotApiToken']}/sendMessage`, TELEGRAM_API_HOST);
        const body = {
            chat_id: config['telegram.workChatId'],
            text,
            parse_mode: 'HTML'
        };

        if (!config['telegram.writeToWorkChat']) {
            logger.info(`TELEGRAM MOCK: POST => ${url}, ${JSON.stringify(body)}`);
            return;
        }

        try {
            await doRequest(url.toString(), {
                method: 'POST',
                body,
                json: true,
                originalUrl
            });
        } catch (error) {
            return;
        }
    }

    static NewOrder(id: string, ammount: number): string {
        return [
            '<b>Создан новый заказ</b>',
            `ID: <i>${id}</i>`,
            `Сумма: <i>${ammount}</i>`
        ].join('\n');
    }

    static NewOrderError(message: string): string {
        return [
            '<b>Ошибка при создании нового заказа</b>',
            `<code>${message}</code>`
        ].join('\n');
    }

    static OrderResolved(id: string, status: string) {
        return [
            `<b>Резолюция заказа: ${status}</b>`,
            `ID: <i>${id}</i>`
        ].join('\n');
    }
}
