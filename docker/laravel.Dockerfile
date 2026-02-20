FROM laravelsail/php82-composer:latest

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libz-dev libssl-dev libbrotli-dev libpng-dev libjpeg-dev \
    libfreetype6-dev pkg-config unzip git curl \
    && docker-php-ext-install pdo pdo_mysql \
    && pecl install swoole \
    && docker-php-ext-enable swoole \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the entrypoint script
COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]