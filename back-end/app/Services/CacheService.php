<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class CacheService
{
    /**
     * Default cache duration in seconds (1 hour)
     */
    private const DEFAULT_TTL = 3600;

    /**
     * Cache key prefix for the application
     */
    private const CACHE_PREFIX = 'rms:';

    /**
     * Get cached data or execute callback and cache the result
     *
     * @param string $key Cache key
     * @param callable $callback Function to execute if cache miss
     * @param int|null $ttl Time to live in seconds
     * @return mixed
     */
    public static function remember(string $key, callable $callback, ?int $ttl = null)
    {
        try {
            $fullKey = self::CACHE_PREFIX . $key;
            $ttl = $ttl ?? self::DEFAULT_TTL;

            // Check if key exists
            $cached = Redis::get($fullKey);
            
            if ($cached !== null) {
                return unserialize($cached);
            }

            // Execute callback
            $value = $callback();

            // Store in Redis
            Redis::setex($fullKey, $ttl, serialize($value));

            return $value;

        } catch (\Exception $e) {
            Log::error('Cache remember failed', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);
            return $callback();
        }
    }

    /**
     * Store data in cache
     *
     * @param string $key Cache key
     * @param mixed $value Value to cache
     * @param int|null $ttl Time to live in seconds
     * @return bool
     */
    public static function put(string $key, $value, ?int $ttl = null): bool
    {
        try {
            $fullKey = self::CACHE_PREFIX . $key;
            $ttl = $ttl ?? self::DEFAULT_TTL;

            return Redis::setex($fullKey, $ttl, serialize($value));

        } catch (\Exception $e) {
            Log::error('Cache put failed', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get cached data
     *
     * @param string $key Cache key
     * @param mixed $default Default value if not found
     * @return mixed
     */
    public static function get(string $key, $default = null)
    {
        try {
            $fullKey = self::CACHE_PREFIX . $key;
            $cached = Redis::get($fullKey);

            return $cached !== null ? unserialize($cached) : $default;

        } catch (\Exception $e) {
            Log::error('Cache get failed', [
                'key' => $key,
                'error' => $e->getMessage()
            ]);
            return $default;
        }
    }

    /**
     * Check if key exists in cache
     *
     * @param string $key Cache key
     * @return bool
     */
    public static function has(string $key): bool
    {
        try {
            $fullKey = self::CACHE_PREFIX . $key;
            return Redis::exists($fullKey) > 0;

        } catch (\Exception $e) {
            Log::error('Cache has check failed', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Delete cached data
     *
     * @param string $key Cache key
     * @return bool
     */
    public static function forget(string $key): bool
    {
        try {
            $fullKey = self::CACHE_PREFIX . $key;
            return Redis::del($fullKey) > 0;

        } catch (\Exception $e) {
            Log::error('Cache forget failed', [
                'key' => $key,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Flush cache by pattern (for related keys)
     *
     * @param string $pattern Pattern to match keys (e.g., "user:*")
     * @return bool
     */
    public static function forgetPattern(string $pattern): bool
    {
        try {
            $fullPattern = self::CACHE_PREFIX . $pattern;
            
            // Get all matching keys
            $keys = Redis::keys($fullPattern);
            
            if (empty($keys)) {
                return true;
            }

            // Delete all matching keys
            Redis::del(...$keys);

            return true;

        } catch (\Exception $e) {
            Log::error('Cache forget pattern failed', [
                'pattern' => $pattern,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Clear all application cache
     *
     * @return bool
     */
    public static function clearAll(): bool
    {
        try {
            // Clear only keys with our prefix
            $keys = Redis::keys(self::CACHE_PREFIX . '*');
            
            if (!empty($keys)) {
                Redis::del(...$keys);
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Cache clear all failed', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    // ==== helper methods ====

    /**
     * Generate cache key for user profile
     */
    public static function userKey(int $userId): string
    {
        return "user:{$userId}:profile";
    }

    /**
     * Generate cache key for routine entries
     */
    public static function routineKey(int $routineId): string
    {
        return "routine:{$routineId}";
    }

    /**
     * Generate cache key for batch routine
     */
    public static function batchRoutineKey(int $batchId, ?int $semesterId = null): string
    {
        return $semesterId 
            ? "batch:{$batchId}:semester:{$semesterId}:routine"
            : "batch:{$batchId}:routine";
    }

    /**
     * Generate cache key for teacher schedule
     */
    public static function teacherScheduleKey(int $teacherId, ?string $date = null): string
    {
        return $date 
            ? "teacher:{$teacherId}:schedule:{$date}"
            : "teacher:{$teacherId}:schedule";
    }
}