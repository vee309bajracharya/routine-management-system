<?php

namespace App\Http\Controllers\Routines;

use Illuminate\Http\Request;
use App\Services\CacheService;
use App\Http\Controllers\Controller;

class RoutineHelperController extends Controller
{
    // helper function to clear routine caches
    public function clearRoutineCaches($routine)
    {
        // Clear specific routine cache
        CacheService::forget(CacheService::routineKey($routine->id));

        // Clear shift-specific grid caches
        $baseGridKey = CacheService::routineGridKey($routine->id, '');
        CacheService::forget($baseGridKey);
        CacheService::forget($baseGridKey . ':Morning'); // Morning shift cache
        CacheService::forget($baseGridKey . ':Day');     // Day shift cache

        // Clear saved versions list
        CacheService::forget(CacheService::routineSavedVersionsKey($routine->id));

        // Clear batch-related caches
        if ($routine->batch_id) {
            CacheService::forgetPattern("batch:{$routine->batch_id}:*");
        }

        // Clear all teacher schedules (routine affects teacher schedules)
        CacheService::forgetPattern("teacher:*:schedule*");

        // Clear routines list caches (affects listing pages)
        CacheService::forgetPattern("routines:list:*");

        // Clear room availability caches
        CacheService::forgetPattern("room:*:availability");
    }

    /**
     * Clear grid cache only (useful for bulk operations)
     * @param int $routineId
     */
    public function clearGridCache($routineId)
    {
        $baseGridKey = CacheService::routineGridKey($routineId, '');
        CacheService::forget($baseGridKey);
        CacheService::forget($baseGridKey . ':Morning');
        CacheService::forget($baseGridKey . ':Day');
        CacheService::forget($baseGridKey . ':all');
    }
}
