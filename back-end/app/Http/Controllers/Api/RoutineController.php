<?php

namespace App\Http\Controllers\Api;

use App\Models\Routine;
use App\Models\TimeSlot;
use App\Models\RoutineEntry;
use Illuminate\Http\Request;
// use App\Models\SavedRoutine;
use App\Services\CacheService;
use App\Models\CourseAssignment;
use Illuminate\Support\Facades\DB;
use App\Models\TeacherAvailability;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\Routines\RoutineListResource;
use App\Http\Resources\Routines\RoutineDetailResource;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RoutineController extends Controller
{
    //TTL Cache constants
    private const ROUTINE_CACHE_TTL = 3600; // 1hr
    private const GRID_CACHE_TTL = 7200; // 2hrs
    private const SAVED_ROUTINES_TTL = 1800; // 30mins

    //============  Group 1: Basic CRUDs ====================

    /**
     * index() - Display listing of routines with filters and pagination
     */

    public function index(Request $request)
    {
        try {
            $cacheKey = 'routines:list:' . md5(json_encode($request->all()));

            $routines = CacheService::remember($cacheKey, function () use ($request) {
                $query = Routine::with([
                    'institution:id,institution_name',
                    'semester:id,semester_name',
                    'batch:id,batch_name',
                    'generatedBy:id,name'
                ])
                    ->orderBy('created_at', 'desc');

                // apply filters
                if ($request->has('status'))
                    $query->where('status', $request->status);
                if ($request->has('institution_id'))
                    $query->where('institution_id', $request->institution_id);
                if ($request->has('semester_id'))
                    $query->where('semester_id', $request->semester_id);
                if ($request->has('batch_id'))
                    $query->where('batch_id', $request->batch_id);
                // Search by title
                if ($request->has('search')) {
                    $query->where('title', 'like', '%' . $request->search . '%');
                }
                return $query->paginate(15);
            }, 1800);

            return RoutineListResource::collection($routines)->additional([
                'success' => true
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch routines',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create new routine
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'semester_id' => 'required|exists:semesters,id',
            'batch_id' => 'nullable|exists:batches,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'effective_from' => 'required|date',
            'effective_to' => 'required|date|after:effective_from',
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
            $routine = Routine::create([
                'institution_id' => auth()->user()->institution_id,
                'semester_id' => $request->semester_id,
                'batch_id' => $request->batch_id,
                'title' => $request->title,
                'description' => $request->description,
                'generated_by' => auth()->id(),
                'status' => 'draft',
                'published_at' => null,
                'effective_from' => $request->effective_from,
                'effective_to' => $request->effective_to,
            ]);

            $this->clearRoutineCaches($routine); //clear cache as new routine affects listing

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Routine created successfully',
                'data' => [
                    'id' => $routine->id,
                    'title' => $routine->title,
                    'description' => $routine->description,
                    'status' => $routine->status,
                    'effective_from' => $routine->effective_from,
                    'effective_to' => $routine->effective_to,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create routine: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * show specific routine with all details
     */
    public function show($id)
    {
        try {
            // cache key for specific routine
            $cacheKey = CacheService::routineKey($id);
            $routineData = CacheService::remember(
                $cacheKey,
                function () use ($id) {
                    $routine = Routine::with([
                        'institution:id,institution_name',
                        'semester:id,semester_name',
                        'batch:id,batch_name',
                        'generatedBy:id,name'
                    ])->findOrFail($id);

                    return (new RoutineDetailResource($routine))->toArray(request());
                },
                self::ROUTINE_CACHE_TTL
            );

            return response()->json([
                'success' => true,
                'data' => $routineData,
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Routine not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch routine'
            ], 500);
        }
    }

    /**
     * update routine materials
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'effective_from' => 'sometimes|date',
            'effective_to' => 'sometimes|date|after:effective_from',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'error' => $validator->errors()
            ], 422);
        }
        try {
            $routine = Routine::findOrFail($id); //find routine or fail
            $routine->update($request->only([
                'title',
                'description',
                'effective_from',
                'effective_to',
            ])); //only provided fields update

            // after update, clear cache
            $this->clearRoutineCaches($routine);

            return response()->json([
                'success' => true,
                'message' => 'Routine updated successfully',
                'data' => $routine->fresh() // reload from db
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Routine not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update routine',
            ], 500);
        }
    }

    // soft delete the routine
    public function destroy($id)
    {
        try {
            $routine = Routine::findOrFail($id);
            if ($routine->status === 'published') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete published routine. Archive it first',
                ], 422);
            }
            $routine->delete(); //sets deleted_at timestamp instead of removing the record
            $this->clearRoutineCaches($routine); //clear the caches
            return response()->json([
                'success' => true,
                'message' => 'Routine deleted successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Routine not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete routine',
            ], 500);
        }
    }

    /**
     * Routine validity period ---- on hold
     */
    // public function updateValidity(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'effective_from' => 'required|date',
    //         'effective_to' => 'required|date|after:effective_from',
    //     ]);
    //     if ($validator->fails()) {
    //         return response()->json([
    //             'success' => false,
    //             'errors' => $validator->errors()
    //         ], 422);
    //     }

    //     try {
    //         $routine = Routine::findOrFail($id);
    //         $routine->update([
    //             'effective_from' => $request->effective_from,
    //             'effective_to' => $request->effective_to,
    //             'expiration_notified' => false,
    //             'expiration_notified_at' => null,
    //         ]);

    //         $this->clearRoutineCaches($routine);

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Routine validity updated successfully',
    //             'data' => $routine
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to update validity: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }



    //============  Group 1: Basic CRUD ends ====================

    //============  Group 2: Routine Versions (Save and Load) starts ==================== / on hold
    // public function saveRoutine(Request $request){
    //     $validator = Validator::make($request->all(), [
    //         'routine_id' => 'required|exists:routines,id',
    //         'label' => 'required|string|max:255',
    //         'description' => 'nullable|string',
    //     ]);
    //     if ($validator->fails()) {
    //         return response()->json([
    //             'success' => false,
    //             'errors' => $validator->errors()
    //         ], 422);
    //     }

    //     try {
    //         DB::beginTransaction();

    //         // load routine with all entries
    //         $routine = Routine::with([
    //             'routineEntries.courseAssignment.teacher',
    //             'routineEntries.courseAssignment.course',
    //             'routineEntries.room',
    //             'routineEntries.timeSlot'
    //         ])->findOrFail($request->routine_id);

    //         snapshot
    //         $savedRoutine = SavedRoutine::create([
    //             'routine_id' => $routine->id,
    //             'label' => $request->label,
    //             'description' => $request->description,
    //             'saved_date' => now(),
    //             'routine_snapshot' => [
    //                 'routine' => $routine->toArray(),
    //                 'entries' => $routine->routineEntries->toArray()
    //             ],
    //             'created_by' => auth()->id()
    //         ]);

    //         CacheService::forget('routine:{$routine->id}:saved_versions');

    //         DB::commit();
    //     } catch (\Exception $e) {
    //     }

    // }

    //============  Group 3: Routine Entry Mgmt (to grids) starts ====================
    public function addEntry(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'routine_id' => 'required|exists:routines,id',
            'course_assignment_id' => 'required|exists:course_assignments,id',
            'room_id' => 'required|exists:rooms,id',
            'time_slot_id' => 'required|exists:time_slots,id',
            'day_of_week' => 'required|in:Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'entry_type' => 'required|in:lecture,practical',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        //begin the routine entry
        try {
            DB::beginTransaction();

            // check for room conflict (same room,time,day)
            $roomConflict = RoutineEntry::where('routine_id', $request->routine_id)
                ->where('room_id', $request->room_id)
                ->where('time_slot_id', $request->time_slot_id)
                ->where('day_of_week', $request->day_of_week)
                ->where('is_cancelled', false)
                ->exists();
            if ($roomConflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'Room is already booked for this timeslot'
                ], 422);
            }

            // check for teacher conflict
            $courseAssignment = CourseAssignment::with('teacher')->findOrFail($request->course_assignment_id);
            $teacherId = $courseAssignment->teacher_id;
            $teacherConflict = RoutineEntry::where('routine_id', $request->routine_id)
                ->where('time_slot_id', $request->time_slot_id)
                ->where('day_of_week', $request->day_of_week)
                ->where('is_cancelled', false)
                ->whereHas('courseAssignment', function ($query) use ($teacherId) {
                    $query->where('teacher_id', $teacherId);
                })
                ->exists();
            if ($teacherConflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'Teacher is already assigned to another class at this time'
                ], 422);
            }

            // check for teacher availability
            $timeSlot = TimeSlot::findOrFail($request->time_slot_id);
            $isAvailable = $this->checkTeacherAvailabilityInternal(
                $teacherId,
                $request->day_of_week,
                $timeSlot->start_time->format('H:i')
            );
            if (!$isAvailable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Teacher is not available at this time'
                ], 422);
            }

            // create routine entry
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

            $entry->load([
                'courseAssignment.course',
                'courseAssignment.teacher.user',
                'room',
                'timeSlot'
            ]);

            // clear caches
            $routine = Routine::find($request->routine_id);

            $this->clearRoutineCaches($routine);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Entry added successfully',
                'data' => $entry
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to add entry', [
                'data' => $request->all(),
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to add entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }






































    // ============================================================================
    // HELPER & UTILITY METHODS
    // ============================================================================
    /** 
     * to check if teacher is available at specific time
     */
    private function checkTeacherAvailabilityInternal($teacherId, $dayOfWeek, $time)
    {
        try {
            $availability = TeacherAvailability::where('teacher_id', $teacherId)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->first();

            // if no TeacherAvailability record found, assume teacher isn't available
            if (!$availability)
                return false;

            //check if time falls within available range
            $availableFrom = $availability->available_from->format('H:i');
            $availableTo = $availability->available_to->format('H:i');
            return $time >= $availableFrom && $time <= $availableTo;
        } catch (\Exception $e) {
            return false;
        }
    }





    // ============================================================================
    // PRIVATE HELPER: CLEAR ROUTINE CACHES
    // ============================================================================

    /**
     * Clear all caches related to a routine
     * This is called after any routine modification
     * 
     * @param Routine $routine
     * @return void
     */
    private function clearRoutineCaches($routine)
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
