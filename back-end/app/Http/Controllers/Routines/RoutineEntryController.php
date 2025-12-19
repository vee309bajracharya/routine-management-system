<?php

namespace App\Http\Controllers\Routines;

use App\Models\Routine;
use App\Models\TimeSlot;
use App\Models\RoutineEntry;
use Carbon\Carbon;
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
            'shift' => 'required|in:Morning,Day',
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

            // force delete previous soft-deleted entries to prevent unique constraint violation
            RoutineEntry::withTrashed()
                ->where('routine_id', $request->routine_id)
                ->where('room_id', $request->room_id)
                ->where('time_slot_id', $request->time_slot_id)
                ->where('day_of_week', $request->day_of_week)
                ->where('shift', $request->shift)
                ->forceDelete();

            // before routine entry conflicts are to be checked
            $conflictChecker = app()->make(RoutineConflictController::class);
            $conflictResult = $conflictChecker->checkAllConflicts(
                $request->routine_id,
                $request->course_assignment_id,
                $request->room_id,
                $request->time_slot_id,
                $request->day_of_week,
                $request->shift,
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
                'shift' => $request->shift,
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
            'shift' => 'sometimes|in:Morning,Day',
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
                'shift',
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
                $request->input('shift', $entry->shift),
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
            $entry->delete(); //stores deleted_at timestamp

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

            //force delete the stored deleted_at timestamp
            RoutineEntry::withTrashed()
                ->where('routine_id', $routineId)
                ->forceDelete();

            (new RoutineHelperController())->clearRoutineCaches($routine);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'All routine entries cleared successfully',
                'data' => [
                    'routine_id' => $routineId,
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
    private const GRID_CACHE_TTL = 300; // 5mins

    public function getRoutineGrid($routineId, Request $request)
    {
        try {
            // validate and load routine
            $routine = Routine::findOrFail($routineId);

            // shift param (default Morning)
            $shift = $request->query('shift', 'Morning');
            if (!in_array($shift, ['Morning', 'Day'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid shift. Allowed: Morning, Day.'
                ], 422);
            }

            // cache key per routine + shift
            $cacheKey = CacheService::routineGridKey($routineId, $shift);

            // if `refresh=true` in query, clear cache and rebuild 
            if ($request->query('refresh') === 'true') {
                CacheService::forget($cacheKey);
            }

            $gridPayload = CacheService::remember($cacheKey, function () use ($routine, $shift) {
                // Load entries only for this routine + shift (only active ones)
                $entries = RoutineEntry::with([
                    'courseAssignment.course',
                    'courseAssignment.teacher.user',
                    'room',
                    'timeSlot'
                ])
                    ->where('routine_id', $routine->id)
                    ->where('shift', $shift)
                    ->where('is_cancelled', false)
                    ->get();

                // fetch timeslots for this shift, semester and batch
                $timeSlotsQuery = TimeSlot::query()
                    ->where('is_active', true)
                    ->where('shift', $shift);

                if (!empty($routine->batch_id)) {
                    $timeSlotsQuery->where('batch_id', $routine->batch_id);
                }
                if (!empty($routine->semester_id)) {
                    $timeSlotsQuery->where('semester_id', $routine->semester_id);
                }

                // fallback: if none found for batch/semester, get all active timeslots for institution
                $timeSlots = $timeSlotsQuery->orderBy('slot_order')->get();
                if ($timeSlots->isEmpty()) {
                    $timeSlots = TimeSlot::where('is_active', true)
                        ->where('shift', $shift)
                        ->orderBy('slot_order')
                        ->get();
                }

                // build canonical slot keys (use H:i format)
                $slotKeys = $timeSlots->mapWithKeys(function ($slot) {
                    $start = Carbon::parse($slot->start_time)->format('H:i');
                    $end = Carbon::parse($slot->end_time)->format('H:i');
                    $key = "{$start} - {$end}";
                    return [
                        $slot->id => [
                            'key' => $key,
                            'slot' => $slot
                        ]
                    ];
                })->toArray();

                $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

                // initialize grid: day => slotKey => null
                $grid = [];
                foreach ($days as $day) {
                    $grid[$day] = [];
                    foreach ($slotKeys as $slotMeta) {
                        $grid[$day][$slotMeta['key']] = null;
                    }
                }

                // fill grid: for every entry map to the correct day + slot key
                foreach ($entries as $entry) {
                    if (!$entry->timeSlot)
                        continue; // skip if no timeslot relation

                    $start = Carbon::parse($entry->timeSlot->start_time)->format('H:i');
                    $end = Carbon::parse($entry->timeSlot->end_time)->format('H:i');
                    $slotKey = "{$start} - {$end}";

                    // guard: ensure day exists in grid
                    if (!isset($grid[$entry->day_of_week]))
                        continue;

                    // set entry resource
                    $grid[$entry->day_of_week][$slotKey] = new RoutineEntryResource($entry);
                }

                return [
                    'grid' => $grid,
                    'shift' => $shift,
                    'total_entries' => $entries->count(),
                    'time_slots_count' => count($slotKeys),
                    'time_slots' => $timeSlots,
                ];
            }, self::GRID_CACHE_TTL);

            $timeSlotsMetadata = $gridPayload['time_slots']->map(function ($slot) {
                $start = Carbon::parse($slot->start_time)->format('H:i');
                $end = Carbon::parse($slot->end_time)->format('H:i');
                $key = "{$start} - {$end}";

                return [
                    'key' => $key,
                    'id' => $slot->id,
                    'name' => $slot->name,
                    'slot_type' => $slot->slot_type,
                    'slot_order' => $slot->slot_order ?? 0,
                    'start_time' => $start,
                    'end_time' => $end,
                ];
            })->values();

            return response()->json([
                'success' => true,
                'message' => 'Routine grid generated successfully',
                'shift' => $gridPayload['shift'],
                'data' => $gridPayload['grid'],
                'meta' => [
                    'total_entries' => $gridPayload['total_entries'],
                    'time_slots' => $timeSlotsMetadata,
                    'time_slots_count' => $gridPayload['time_slots_count'],
                ]
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Routine not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate routine grid',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
