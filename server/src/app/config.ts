import * as assert from 'assert';

type EnvironmentType = 'tests' | 'production' | 'testing' | 'stress' | 'development';
const environment: EnvironmentType = process.env.NODEJS_ENV! as EnvironmentType || 'development';

interface Config {
    'logger.colorize': boolean;
    'logger.level': 'info' | 'silly';
    'telegram.workChatId': number;
    'telegram.writeToWorkChat': boolean;
    'cors.origin': string;
    'admin.disableAuth': boolean;
    'admin.authRedirect': string;
    'request.retries': number;
    'request.timeout': number;
    'db.ssl': boolean;
    'env.telegramBotApiToken': string;
    'env.yandexOauthId': string;
    'env.yandexOauthPassword': string;
    'env.appPort': number;
    'env.appEnvironment': EnvironmentType;
    'env.appDisableLog': boolean;
}

const appPort = Number(process.env.NODEJS_PORT);
const production: Config = {
    'logger.colorize': false,
    'logger.level': 'info',
    'telegram.workChatId': -363392954,
    'telegram.writeToWorkChat': true,
    'cors.origin': 'https://pandaphone.ru',
    'admin.disableAuth': false,
    'admin.authRedirect': 'https://pandaphone.ru/bender-root',
    'db.ssl': true,
    'request.retries': 1,
    'request.timeout': 2000,
    'env.telegramBotApiToken': process.env.PANDA_PHONE_TELEGRAM_BOT_API_TOKEN!,
    'env.yandexOauthId': process.env.PANDA_PHONE_YANDEX_OAUTH_ID!,
    'env.yandexOauthPassword': process.env.PANDA_PHONE_YANDEX_OAUTH_PASS!,
    'env.appPort': isNaN(appPort) ? 3000 : appPort,
    'env.appEnvironment': environment,
    'env.appDisableLog': !!process.env.NODEJS_DISABLE_LOGGING
};

const testing: Config = {
    ...production
};

const development: Config = {
    ...testing,
    'logger.colorize': true,
    'logger.level': 'silly',
    'admin.disableAuth': false,
    'admin.authRedirect': 'http://localhost:3000/bender-root',
    'db.ssl': false,
    'telegram.writeToWorkChat': false,
    'cors.origin': 'http://localhost:3000'
};

const stress: Config = {
    ...testing
};

const tests: Config = {
    ...development,
    'admin.disableAuth': true
};

const configs: {[key: string]: Config} = {tests, production, testing, stress, development};
const config = configs[environment];
assert(config, `There is no configuration for environment "${environment}"`);

function getEnv(key: string): string | undefined {
    return process.env[key];
}

[
    'PANDA_PHONE_TELEGRAM_BOT_API_TOKEN',
    'PANDA_PHONE_YANDEX_OAUTH_ID',
    'PANDA_PHONE_YANDEX_OAUTH_PASS'
].forEach((key) => assert(getEnv(key), `Environment variable "${key}" wasn't set`));

export {config};
