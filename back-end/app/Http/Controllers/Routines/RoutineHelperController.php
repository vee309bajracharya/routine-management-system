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

        // Clear routine grid cache
        CacheService::forget(CacheService::routineGridKey($routine->id));

        // Clear saved versions list
        CacheService::forget(CacheService::routineSavedVersionsKey($routine->id));

        // Clear batch-related caches
        if ($routine->batch_id) {
            CacheService::forgetPattern("batch:{$routine->batch_id}:*");
        }

        // Clear all teacher schedules (routine affects teacher schedules)
        CacheService::forgetPattern("teacher:*:schedule*");

        // Clear routines list caches
        CacheService::forgetPattern("routines:list:*");

        // Clear room availability caches
        CacheService::forgetPattern("room:*:availability");
    }
}
