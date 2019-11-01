FROM ubuntu:16.04

WORKDIR /usr/local/app
ENV WORKDIR /usr/local/app

RUN apt-get update
RUN apt-get install -fy wget git vim gettext-base net-tools
RUN apt-get install -fy build-essential
RUN apt-get install -fy nginx-full
RUN apt-get install -fy curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -fy nodejs
RUN apt-get install -fy supervisor
RUN apt-get install -fy sudo

COPY . .

RUN make deps
RUN make build-server-production
RUN make build-client-production

RUN make prune

RUN mkdir /config-templates
RUN cp $WORKDIR/deploy/production/config-templates/nginx.template.conf /config-templates/nginx.template.conf
RUN cp $WORKDIR/deploy/production/config-templates/supervisord.template.conf /config-templates/supervisord.template.conf
RUN cp $WORKDIR/deploy/production/start.sh /

ENV NODEJS_APP $WORKDIR/build/server/src/app/app.js
ENV NODEJS_ENV production
CMD ["/start.sh"]
