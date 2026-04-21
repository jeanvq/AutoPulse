FROM php:8.2-apache

RUN a2dismod mpm_event && \
    a2enmod mpm_prefork && \
    a2enmod rewrite && \
    docker-php-ext-install pdo pdo_mysql

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html

EXPOSE 80