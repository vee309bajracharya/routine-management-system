#!/bin/sh
set -e

# Install dependencies if missing (only if vendor folder doesn't exist)
if [ ! -d "vendor" ]; then
    echo "Installing composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
sleep 20

# Run Migrations
echo "Running migrations..."
php artisan migrate --force

# Clear and rebuild cache
echo "Optimizing Laravel..."
php artisan config:cache
php artisan route:cache

# Start Laravel Octane
echo "Starting Octane with Swoole..."
exec php artisan octane:start --server=swoole --host=0.0.0.0 --port=8000 --workers=4 --task-workers=6