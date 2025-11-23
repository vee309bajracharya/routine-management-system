<?php

namespace App\Http\Controllers\Routines;

use App\Models\Routine;
use App\Models\TimeSlot;
use App\Models\RoutineEntry;
use Illuminate\Http\Request;
use App\Services\CacheService;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\Routines\RoutineEntryResource;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Controllers\Routines\RoutineConflictController;

class RoutineEntryController extends Controller
{
    // add routine entry to grid
    public function addEntry(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'routine_id' => 'required|exists:routines,id',
            'course_assignment_id' => 'required|exists:course_assignments,id',
            'room_id' => 'required|exists:rooms,id',
            'time_slot_id' => 'required|exists:time_slots,id',
            'day_of_week' => 'required|in:Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'entry_type' => 'required|in:Lecture,Practical,Break',
            'notes' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        // begin the routine entry
        try {
            DB::beginTransaction();

            // before routine entry conflicts are to be checked
            $conflictChecker = app()->make(RoutineConflictController::class);
            $conflictResult = $conflictChecker->checkAllConflicts(
                $request->routine_id,
                $request->course_assignment_id,
                $request->room_id,
                $request->time_slot_id,
                $request->day_of_week,
            );

            if ($conflictResult !== true) {
                DB::rollBack();
                return $conflictResult; // error message returned by RoutineConflictController
            }
            // entry starts

            $entry = RoutineEntry::create([
                'routine_id' => $request->routine_id,
                'course_assignment_id' => $request->course_assignment_id,
                'room_id' => $request->room_id,
                'time_slot_id' => $request->time_slot_id,
                'day_of_week' => $request->day_of_week,
                'entry_type' => $request->entry_type,
                'is_cancelled' => false,
                'notes' => $request->notes,
            ]);

            $routine = Routine::find($request->routine_id);
            (new RoutineHelperController())->clearRoutineCaches($routine); //clear cache
            DB::commit();

            return new RoutineEntryResource($entry); //load relations
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add Entry',
                'error' => $e->getMessage(),
            ], 500);

        }
    }

    // update routine entry of grid
    public function updateEntry(Request $request, $entryId)
    {
        $validator = Validator::make($request->all(), [
            'course_assignment_id' => 'sometimes|exists:course_assignments,id',
            'room_id' => 'sometimes|exists:rooms,id',
            'time_slot_id' => 'sometimes|exists:time_slots,id',
            'day_of_week' => 'sometimes|in:Sunday,Monday,Tuesday,Wednesday,Thursday,Friday',
            'entry_type' => 'sometimes|in:Lecture,Practical,Break',
            'notes' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            $entry = RoutineEntry::findOrFail($entryId);
            $updateData = $request->only([
                'course_assignment_id',
                'room_id',
                'time_slot_id',
                'day_of_week',
                'entry_type',
                'notes'
            ]);
            // before routine entry updates, conflicts are to be checked
            $conflictChecker = app()->make(RoutineConflictController::class);
            $conflictResult = $conflictChecker->checkAllConflicts(
                $entry->routine_id,
                $request->input('course_assignment_id', $entry->course_assignment_id),
                $request->input('room_id', $entry->room_id),
                $request->input('time_slot_id', $entry->time_slot_id),
                $request->input('day_of_week', $entry->day_of_week),
                $entryId // exclude itself
            );
            if ($conflictResult !== true) {
                DB::rollBack();
                return $conflictResult; // error message returned by RoutineConflictController
            }

            $entry->update($updateData); // update entry

            $routine = Routine::find($entry->routine_id);
            (new RoutineHelperController())->clearRoutineCaches($routine); // clear cache

            DB::commit();

            return new RoutineEntryResource($entry); // load relations
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Entry not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update entry',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // delete routine entry of grid
    public function deleteEntry($entryId)
    {
        try {
            DB::beginTransaction();
            $entry = RoutineEntry::findOrFail($entryId);
            $routineId = $entry->routine_id;
            $entry->delete();

            $routine = Routine::find($routineId);
            (new RoutineHelperController())->clearRoutineCaches($routine);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Entry deleted successfully'
            ], 200);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Entry not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete entry',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // clear all entries from a routine
    public function clearRoutine($routineId)
    {
        try {
            DB::beginTransaction();

            $routine = Routine::findOrFail($routineId);
            $deletedCount = RoutineEntry::where('routine_id', $routineId)->delete();
            (new RoutineHelperController())->clearRoutineCaches($routine);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'All routine entries cleared successfully',
                'data' => [
                    'routine_id' => $routineId,
                    'entries_deleted' => $deletedCount
                ]
            ], 200);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Routine data not found',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear routine data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // get the grid format routine details
    private const GRID_CACHE_TTL = 7200; // 2hrs

    public function getRoutineGrid($routineId)
    {
        try {
            // check if routine exists
            $routine = Routine::findOrFail($routineId);

            // Cache key
            $cacheKey = CacheService::routineGridKey($routineId);

            // Return cached data if available, otherwise build fresh
            $grid = CacheService::remember($cacheKey, function () use ($routineId) {

                // Load entries with needed relations
                $entries = RoutineEntry::with([
                    'courseAssignment.course',
                    'courseAssignment.teacher.user',
                    'room',
                    'timeSlot'
                ])
                    ->where('routine_id', $routineId)
                    ->orderBy('day_of_week')
                    ->get();

                // Load time slots (sorted)
                $timeSlots = TimeSlot::orderBy('start_time')->get();

                $grid = [];

                // Initialize the grid with nulls first
                foreach (['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as $day) {
                    $grid[$day] = [];

                    foreach ($timeSlots as $slot) {
                        $grid[$day][$slot->start_time . ' - ' . $slot->end_time] = null;
                    }
                }

                // Fill the grid
                foreach ($entries as $entry) {
                    $slotKey = $entry->timeSlot->start_time . ' - ' . $entry->timeSlot->end_time;
                    $grid[$entry->day_of_week][$slotKey] = new RoutineEntryResource($entry);
                }

                return $grid;
            }, self::GRID_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Routine grid generated successfully',
                'data' => $grid,
            ], 200);


        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate routine grid',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


}
