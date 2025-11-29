<?php

namespace App\Http\Controllers\Routines;

use App\Models\Routine;
use App\Models\RoutineEntry;
use App\Models\SavedRoutine;
use Illuminate\Http\Request;
use App\Services\CacheService;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Controllers\Routines\RoutineHelperController;

class RoutineVersionController extends Controller
{
    private const SAVED_ROUTINES_TTL = 1800; // 30mins

    /**
     * Save the current routine version
     */
    public function saveRoutine(Request $request)
    {
        $routineId = $request->routine_id;

        DB::beginTransaction();
        try {
            $routine = Routine::findOrFail($routineId); //find the Routine

            // get all routine entries
            $entries = RoutineEntry::where('routine_id', $routineId)->get();
            $entriesArray = $entries->map(function ($entry) {
                return array_merge($entry->toArray(), [
                    'shift' => $entry->shift ?? 'Morning'
                ]);
            })->toArray();


            $saved = SavedRoutine::create([
                'routine_id' => $routineId,
                'label' => $request->label,
                'description' => $request->description,
                'saved_date' => now()->toDateString(),
                'routine_snapshot' => $entriesArray,
                'created_by' => $request->user()->id,
            ]);

            DB::commit();

            $cacheKey = CacheService::routineSavedVersionsKey($routineId);
            CacheService::forget($cacheKey);

            return response()->json([
                'success' => true,
                'message' => 'Routine version saved successfully',
                'data' => $saved,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to save routine version',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * get all saved routine versions
     *  - any one routine generation (of any dept.) can have multiple saved versions (sample, draft, final) - so load all of them based on the routine_id
     */
    public function getSavedRoutines($routineId)
    {
        try {
            // initally, check if routine exists
            $routine = Routine::findOrFail($routineId);

            //if exists, cache it
            $cacheKey = CacheService::routineSavedVersionsKey($routineId);
            //if not in cache, fetch from db
            $savedVersions = CacheService::remember($cacheKey, function () use ($routineId) {
                return SavedRoutine::where('routine_id', $routineId)
                    ->with('createdBy:id')
                    ->orderBy('created_at', 'desc')
                    ->get();
            }, self::SAVED_ROUTINES_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Saved routine versions fetched successfully',
                'data' => $savedVersions,
            ], 200);
        } catch (\Exception $e) {
            //if routine_id doesn't exist
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch saved routine versions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * load a saved routine version
     */
    public function loadSavedRoutine($savedRoutineId)
    {
        DB::beginTransaction();
        try {
            $saved = SavedRoutine::findOrFail($savedRoutineId); // find the saved routine
            $routineId = $saved->routine_id;

            $routine = Routine::findOrFail($routineId);

            //decode the snapshot
            $entries = is_string($saved->routine_snapshot) ? json_decode($saved->routine_snapshot, true) : $saved->routine_snapshot;

            if (!is_array($entries)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid routine snapshot format',
                ], 500);
            }
            $seen = [];
            $duplicates = [];

            foreach ($entries as $e) {
                // Create unique key including shift
                $shift = $e['shift'] ?? 'Morning';
                $key = implode('-', [
                    $e['room_id'],
                    $e['day_of_week'],
                    $e['time_slot_id'],
                    $shift
                ]);

                if (isset($seen[$key])) {
                    $duplicates[] = $e;
                } else {
                    $seen[$key] = true;
                }
            }

            if (!empty($duplicates)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Snapshot contains duplicate entries. Cannot restore.',
                    'duplicates' => $duplicates
                ], 422);
            }

            RoutineEntry::withTrashed()
                ->where('routine_id', $routineId)
                ->forceDelete();

            $restoredCount = 0;
            foreach ($entries as $entry) {
                RoutineEntry::create([
                    'routine_id' => $routineId,
                    'room_id' => $entry['room_id'],
                    'day_of_week' => $entry['day_of_week'],
                    'time_slot_id' => $entry['time_slot_id'],
                    'shift' => $entry['shift'] ?? 'Morning',
                    'entry_type' => $entry['entry_type'] ?? 'Lecture',
                    'course_assignment_id' => $entry['course_assignment_id'] ?? null,
                    'notes' => $entry['notes'] ?? null,
                    'is_cancelled' => $entry['is_cancelled'] ?? false,
                    'cancellation_reason' => $entry['cancellation_reason'] ?? null,
                ]);
                $restoredCount++;
            }

            (new RoutineHelperController())->clearRoutineCaches($routine);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Routine loaded successfully from saved version',
                'data' => [
                    'routine_id' => $routineId,
                    'entries_restored' => $restoredCount,
                    'version_label' => $saved->label,
                    'saved_date' => $saved->saved_date,
                ]
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Saved routine version not found',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to load saved routine',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


}
