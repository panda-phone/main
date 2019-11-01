# panda-phone

### Environment

```bash
# REQUIRED

# Example of database config file://server/res/db.json
{
    "host": "XXXXXXXXXXXXXXX",
    "user": "XXXXXXXXXXXXXXX",
    "password": "XXXXXXXXXXXXXXX",
    "database": "XXXXXXXXXXXXXXX",
    "port": 000000
}

export PANDA_PHONE_TELEGRAM_BOT_API_TOKEN=$(value)
export PANDA_PHONE_YANDEX_OAUTH_ID=$(value)
export PANDA_PHONE_YANDEX_OAUTH_PASS=$(value)

# OPTIONAL
export NODEJS_PORT=$(value)
export NODEJS_DISABLE_LOGGING=$(value)
export NODEJS_ENV=$(value)
```

### Database instruction

```bash
CREATE USER $(username) WITH SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD '$(password)';
CREATE DATABASE $(dbname) WITH ENCODING 'UTF8' OWNER $(rolename);
SET timezone='UTC';
```

### Commands

```bash
sudo docker pull cr.yandex/crpn0q4tiksugq5qds8d/ubuntu:$(VERSION)
sudo docker run -it -p 3000:80 --env-file ./panda-phone-env.list -v ./db.json:/usr/local/app/server/configs/db.json -d cr.yandex/crpn0q4tiksugq5qds8d/ubuntu:$(VERSION)
```
