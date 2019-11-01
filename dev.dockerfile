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

RUN mkdir /config-templates
RUN cp $WORKDIR/deploy/development/config-templates/nginx.template.conf /config-templates/nginx.template.conf
RUN cp $WORKDIR/deploy/development/config-templates/supervisord.template.conf /config-templates/supervisord.template.conf
RUN cp $WORKDIR/deploy/development/start.sh /

CMD ["/start.sh"]
