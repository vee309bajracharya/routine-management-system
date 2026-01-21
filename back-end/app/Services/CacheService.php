<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class CacheService
{
    /**
     * Default cache duration in seconds (15mins)
     */
    private const DEFAULT_TTL = 900;

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
            Redis::setex($fullKey, $ttl, serialize($value)); //serialize to convert php data to string for storage

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

            return Redis::setex($fullKey, $ttl, serialize($value)); //set key with expiration in one atomic operation

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
     * "user:1:profile"
     */
    public static function userKey(int $userId): string
    {
        return "user:{$userId}:profile";
    }

    /**
     * @param int $id
     * @return string
     * Generate cache key for showing user details
     */
    public static function userModelKey(int $id): string
    {
        return "user:model:{$id}";
    }

    /**
     * Generate cache key for routine entries
     * "routine:5"
     */
    public static function routineKey(int $routineId): string
    {
        return "routine:{$routineId}";
    }

    /**
     * Generate cache key for routine grid view
     * Example: "routine:5:grid" or "routine:5:grid:morning"
     * This is separate because grid is frequently accessed
     */
    public static function routineGridKey(int $routineId, ?string $shift = null): string
    {
        return $shift
            ? "routine:{$routineId}:grid:{$shift}"
            : "routine:{$routineId}:grid";
    }

    /**
     * Generate cache key for routine's saved versions list
     * Example: "routine:5:saved_versions"
     */
    public static function routineSavedVersionsKey(int $routineId): string
    {
        return "routine:{$routineId}:saved_versions";
    }

    // cache key for preview saved versions
    public static function routineSavedPreviewKey(int $savedRoutineId): string
    {
        return "routine:saved:preview:{$savedRoutineId}";
    }

    /**
     * Generate cache key for batch routine
     * "batch:3:semester:5:routine" or "batch:3:routine"
     */
    public static function batchRoutineKey(int $batchId, ?int $semesterId = null): string
    {
        return $semesterId
            ? "batch:{$batchId}:semester:{$semesterId}:routine"
            : "batch:{$batchId}:routine";
    }

    /**
     * Generate cache key for teacher schedule
     * "teacher:7:schedule:2025-01-15" or "teacher:7:schedule"
     */
    public static function teacherScheduleKey(int $teacherId, ?string $date = null): string
    {
        return $date
            ? "teacher:{$teacherId}:schedule:{$date}"
            : "teacher:{$teacherId}:schedule";
    }

    /**
     * Generate cache key for room availability
     * Example: "room:4:availability"
     */
    public static function roomAvailabilityKey(int $roomId): string
    {
        return "room:{$roomId}:availability";
    }

    /**
     * Generate cache key for course assignments list
     * Can include filters as part of key
     * Example: "course_assignments:semester:5:batch:3"
     */
    public static function courseAssignmentsKey(?int $semesterId = null, ?int $batchId = null): string
    {
        $key = "course_assignments";
        if ($semesterId)
            $key .= ":semester:{$semesterId}";
        if ($batchId)
            $key .= ":batch:{$batchId}";
        return $key;
    }

    /**
     * Generate cache key for time slots list
     * Example: "institution:1:time_slots"
     */
    public static function timeSlotsKey(int $institutionId): string
    {
        return "institution:{$institutionId}:time_slots";
    }

    /**
     * Generate cache key for departments list
     * Example: "institution:1:departments"
     */
    public static function departmentsKey($institutionId): string
    {
        return "institution:{$institutionId}:departments";
    }

    /**
     * Generate cache key for batches list
     * Can include filters for more specific caching
     * Example: "institution:1:batches:department:2"
     */
    public static function batchesKey(int $institutionId, ?int $departmentId = null): string
    {
        $key = "institution:{$institutionId}:batches";
        if ($departmentId)
            $key .= ":department:{$departmentId}";
        return $key;
    }

    /**
     * Generate cache key for rooms list
     * Example: "institution:1:rooms" or "institution:1:rooms:lab"
     */
    public static function roomsKey(int $institutionId, ?string $roomType = null): string
    {
        $key = "institution:{$institutionId}:rooms";
        if ($roomType)
            $key .= ":{$roomType}";
        return $key;
    }

    /**
     * Generate cache key for routines list with filters
     * Example: "routines:list:institution:1:semester:5:batch:3"
     */
    public static function routinesListKey(int $institutionId, ?int $semesterId = null, ?int $batchId = null, ?string $status = null): string
    {
        $key = "routines:list:institution:{$institutionId}";

        if ($semesterId)
            $key .= ":semester:{$semesterId}";

        if ($batchId)
            $key .= ":batch:{$batchId}";

        if ($status)
            $key .= ":status:{$status}";

        return $key;
    }

    /**
     * Clear all caches related to a specific routine
     * - called whenever a routine is updated to ensure fresh data
     *
     * @param int $routineId
     * @param int|null $batchId Optional batch ID to clear batch-specific caches
     * @return void
     */
    public static function clearRoutineCaches(int $routineId, ?int $batchId = null): void
    {
        self::forget(self::routineKey($routineId)); // clear the routine itself

        self::forget(self::routineGridKey($routineId)); //clear the routine grid view

        self::forget(self::routineSavedVersionsKey($routineId)); //clear saved versions list

        if ($batchId)
            self::forgetPattern("batch:{$batchId}:*"); // clear batch related caches if batchId is provided

        self::forgetPattern("teacher:*:schedule*"); // clear all teacher schedule as routine affects it

        self::forgetPattern("routines:list:*"); //clear routines list caches
    }

    /**
     * Clear all caches related to a specific institution
     * - when institution settings change
     *
     * @param int $institutionId
     * @return void
     */
    public static function clearInstitutionCaches(int $institutionId): void
    {
        self::forgetPattern("institution:{$institutionId}:*");
    }

}