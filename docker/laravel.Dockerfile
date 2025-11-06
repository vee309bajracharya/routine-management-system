# docker/laravel.Dockerfile
FROM laravelsail/php82-composer:latest

# Install system dependencies, PHP extensions, Swoole and Node
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      git \
      unzip \
      pkg-config \
      libz-dev \
      libssl-dev \
      libbrotli-dev \
      libpng-dev \
      libjpeg-dev \
      libfreetype6-dev \
      ca-certificates \
      curl && \
    # install php pdo_mysql
    docker-php-ext-install pdo pdo_mysql && \
    # install nodejs (NodeSource 18.x) and npm
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    # update pecl channel and install swoole
    pecl channel-update pecl.php.net && \
    pecl install swoole && \
    docker-php-ext-enable swoole && \
    # cleanup apt caches to reduce image size
    rm -rf /var/lib/apt/lists/* /tmp/pear/* /root/.npm /root/.cache