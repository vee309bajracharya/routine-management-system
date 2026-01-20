<?php

namespace App\Http\Controllers\Admin;

use App\Models\TimeSlot;
use Illuminate\Http\Request;
use App\Services\CacheService;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class TimeSlotController extends Controller
{
    private const TIMESLOT_CACHE_TTL = 3600;

    // get all timeslots
    public function index(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;

            $cacheKey = "institution:{$institutionId}:timeslots:list:" . md5(json_encode($request->query()));

            $timeSlots = CacheService::remember($cacheKey, function () use ($institutionId, $request) {
                $query = TimeSlot::where('institution_id', $institutionId)
                    ->with([
                        'department:id,code',
                        'semester:id,semester_name',
                        'batch:id,batch_name,shift',
                    ]);

                // Filter by semester
                if ($request->filled('semester_id'))
                    $query->where('semester_id', $request->semester_id);

                // Filter by batch
                if ($request->filled('batch_id'))
                    $query->where('batch_id', $request->batch_id);

                // Filter by shift
                if ($request->filled('shift'))
                    $query->where('shift', $request->shift);

                // Filter by status
                if ($request->filled('is_active'))
                    $query->where('is_active', $request->is_active);

                //Search by Timeslot, Semester or Batch Name
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhereHas('semester', function ($semQuery) use ($search) {
                                $semQuery->where('semester_name', 'like', "%{$search}%");
                            })
                            ->orWhereHas('batch', function ($batchQuery) use ($search) {
                                $batchQuery->where('batch_name', 'like', "%{$search}%");
                            });
                    });
                }

                return $query->orderBy('created_at', 'desc')->paginate(10);
            }, self::TIMESLOT_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Timeslots fetched successfully',
                'data' => $timeSlots->map(function ($slot) {
                    return [
                        // primary ones for index
                        'id' => $slot->id,
                        'name' => $slot->name,
                        'start_time' => $slot->start_time->format('H:i'),
                        'end_time' => $slot->end_time->format('H:i'),
                        'shift' => $slot->shift,
                        'data' => $slot->department ? [
                            'id' => $slot->department->id,
                            'department_code' => $slot->department->code,
                        ] : null,
                        'semester' => $slot->semester ? [
                            'id' => $slot->semester->id,
                            'semester_name' => $slot->semester->semester_name,
                        ] : null,
                        'batch' => $slot->batch ? [
                            'id' => $slot->batch->id,
                            'name' => $slot->batch->batch_name,
                        ] : null,
                    ];
                }),
                'pagination' => [
                    'current_page' => $timeSlots->currentPage(),
                    'last_page' => $timeSlots->lastPage(),
                    'per_page' => $timeSlots->perPage(),
                    'total' => $timeSlots->total(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch timeslots', $e->getMessage());
        }
    }

    // show timeslot details
    public function show($id)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $cacheKey = "institution:{$institutionId}:timeslot:{$id}:details";

            $timeSlot = CacheService::remember($cacheKey, function () use ($id, $institutionId) {
                return TimeSlot::where('institution_id', $institutionId)
                    ->with([
                        'department:id,code',
                        'semester:id,semester_name',
                        'batch:id,batch_name,shift',
                    ])
                    ->findOrFail($id);
            }, self::TIMESLOT_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Time slot fetched successfully',
                'data' => [
                    // primary
                    'id' => $timeSlot->id,
                    'name' => $timeSlot->name,
                    'start_time' => $timeSlot->start_time->format('H:i'),
                    'end_time' => $timeSlot->end_time->format('H:i'),
                    'shift' => $timeSlot->shift,

                    // secondary
                    'is_active' => $timeSlot->is_active,
                    'duration_minutes' => $timeSlot->duration_minutes,
                    'slot_type' => $timeSlot->slot_type,
                    'applicable_days' => $timeSlot->applicable_days,
                    'slot_order' => $timeSlot->slot_order,
                    'department' => $timeSlot->department ? [
                        'id' => $timeSlot->department->id,
                        'code' => $timeSlot->department->code,
                    ] : null,
                    'semester' => $timeSlot->semester ? [
                        'id' => $timeSlot->semester->id,
                        'semester_name' => $timeSlot->semester->semester_name,
                    ] : null,
                    'batch' => $timeSlot->batch ? [
                        'id' => $timeSlot->batch->id,
                        'name' => $timeSlot->batch->batch_name,
                        'shift' => $timeSlot->batch->shift,
                    ] : null,
                ]
            ], 200);

        } catch (\Exception $e) {
            return $this->errorResponse('Timeslot not found', $e->getMessage(), 404);
        }
    }

    // create new timeslot
    public function store(Request $request)
    {
        $institutionId = auth()->user()->institution_id;
        $validator = Validator::make($request->all(), [
            'department_id' => [
                'required',
                Rule::exists('departments', 'id')->where('institution_id', $institutionId)
            ],
            'semester_id' => [
                'required',
                Rule::exists('semesters', 'id')->where(function ($query) use ($institutionId) {
                    $query->whereIn('academic_year_id', function ($sub) use ($institutionId) {
                        $sub->select('id')->from('academic_years')->where('institution_id', $institutionId);
                    });
                })
            ],
            'batch_id' => [
                'required',
                Rule::exists('batches', 'id')->where('institution_id', $institutionId)
            ],
            'name' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'duration_minutes' => 'required|integer|min:15|max:180',
            'shift' => 'required|in:Morning,Day',
            'slot_type' => 'required|in:Lecture,Break,Practical',
            'applicable_days' => 'nullable|array',
            'applicable_days.*' => 'in:Sunday,Monday,Tuesday,Wednesday,Thursday,Friday',
            'is_active' => 'nullable|boolean',
        ]);
        if ($validator->fails())
            return $this->errorResponse('Validation failed', $validator->errors(), 422);


        // check for overlapping time slots
        $overlap = TimeSlot::where('institution_id', $institutionId)
            ->where('semester_id', $request->semester_id)
            ->where('batch_id', $request->batch_id)
            ->where('shift', $request->shift)
            ->where('is_active', true)
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                    ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('start_time', '<=', $request->start_time)
                            ->where('end_time', '>=', $request->end_time);
                    });
            })
            ->exists();

        if ($overlap)
            return $this->errorResponse('Time slot overlaps with existing time slot', null, 422);


        try {
            DB::beginTransaction();
            $timeSlot = TimeSlot::create([
                'institution_id' => $institutionId,
                'department_id' => $request->department_id,
                'semester_id' => $request->semester_id,
                'batch_id' => $request->batch_id,
                'name' => $request->name,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'duration_minutes' => $request->duration_minutes,
                'slot_type' => $request->slot_type,
                'shift' => $request->shift,
                'slot_order' => $request->slot_order ?? 1,
                'applicable_days' => $request->applicable_days,
                'is_active' => $request->is_active ?? true,
            ]);

            CacheService::forgetPattern("institution:{$institutionId}:timeslots*"); //cache clear
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Time slot created successfully',
                'data' => [
                    // primary
                    'id' => $timeSlot->id,
                    'name' => $timeSlot->name,
                    'start_time' => $timeSlot->start_time->format('H:i'),
                    'end_time' => $timeSlot->end_time->format('H:i'),
                    'shift' => $timeSlot->shift,
                    'slot_type' => $timeSlot->slot_type,
                    'duration_minutes' => $timeSlot->duration_minutes,
                    'applicable_days' => $timeSlot->applicable_days,

                    // secondary
                    'department' => $timeSlot->department ? [
                        'id' => $timeSlot->department->id,
                        'code' => $timeSlot->department->code,
                    ] : null,
                    'semester' => $timeSlot->semester ? [
                        'id' => $timeSlot->semester->id,
                        'semester_name' => $timeSlot->semester->semester_name,
                    ] : null,
                    'batch' => $timeSlot->batch ? [
                        'id' => $timeSlot->batch->id,
                        'name' => $timeSlot->batch->batch_name,
                        'shift' => $timeSlot->batch->shift,
                    ] : null,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to create timeslot', $e->getMessage());
        }
    }

    // update timeslot
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i',
            'shift' => 'sometimes|in:Morning,Day',
            'slot_type' => 'sometimes|in:Lecture,Break,Practical',
            'duration_minutes' => 'sometimes|integer|min:15|max:180',
            'applicable_days' => 'nullable|array',
            'applicable_days.*' => 'in:Sunday,Monday,Tuesday,Wednesday,Thursday,Friday',
            'is_active' => 'nullable|boolean',
        ]);
        if ($validator->fails())
            return $this->errorResponse('Validation failed', $validator->errors(), 422);

        $institutionId = auth()->user()->institution_id;
        $timeSlot = TimeSlot::where('institution_id', $institutionId)->findOrFail($id);
        
        // Validate time range
        $startTime = $request->start_time ?? $timeSlot->start_time->format('H:i');
        $endTime = $request->end_time ?? $timeSlot->end_time->format('H:i');

        if ($startTime >= $endTime)
            return $this->errorResponse('End time must be after start time', null, 422);

        // Check for overlapping if times are being changed
        if ($request->hasAny(['start_time', 'end_time'])) {
            $overlap = TimeSlot::where('institution_id', $institutionId)
                ->where('id', '!=', $id)
                ->where('batch_id', $timeSlot->batch_id)
                ->where('semester_id', $timeSlot->semester_id)
                ->where('shift', $timeSlot->shift)
                ->where('is_active', true)
                ->where(function ($query) use ($startTime, $endTime) {
                    $query->whereBetween('start_time', [$startTime, $endTime])
                        ->orWhereBetween('end_time', [$startTime, $endTime])
                        ->orWhere(function ($q) use ($startTime, $endTime) {
                            $q->where('start_time', '<=', $startTime)
                                ->where('end_time', '>=', $endTime);
                        });
                })
                ->exists();

            if ($overlap)
                return $this->errorResponse('Timeslot overlaps with existing timeslot', null, 422);
        }

        DB::beginTransaction();
        try {

            $timeSlot->update($request->only([
                'name',
                'start_time',
                'end_time',
                'shift',
                'slot_type',
                'duration_minutes',
                'applicable_days',
                'is_active',
            ]));

            //cache clear
            CacheService::forget("institution:{$institutionId}:timeslot:{$id}:details");
            CacheService::forgetPattern("institution:{$institutionId}:timeslots*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Time slot updated successfully',
                'data' => [
                    'id' => $timeSlot->id,
                    'name' => $timeSlot->name,
                    'start_time' => $timeSlot->start_time->format('H:i'),
                    'end_time' => $timeSlot->end_time->format('H:i'),
                    'shift' => $timeSlot->shift,
                    'slot_type' => $timeSlot->slot_type,

                    // secondary
                    'department' => $timeSlot->department ? [
                        'id' => $timeSlot->department->id,
                        'code' => $timeSlot->department->code,
                    ] : null,
                    'semester' => $timeSlot->semester ? [
                        'id' => $timeSlot->semester->id,
                        'semester_name' => $timeSlot->semester->semester_name,
                    ] : null,
                    'batch' => $timeSlot->batch ? [
                        'id' => $timeSlot->batch->id,
                        'name' => $timeSlot->batch->batch_name,
                        'shift' => $timeSlot->batch->shift,
                    ] : null,
                ]
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to update timeslot', $e->getMessage());
        }
    }

    // delete timeslot
    public function destroy($id)
    {
        $institutionId = auth()->user()->institution_id;
        $timeSlot = TimeSlot::where('institution_id', $institutionId)->findOrFail($id);

        if ($timeSlot->routineEntries()->exists())
            return $this->errorResponse('Cannot delete timeslot already used in routines', null, 422);

        DB::beginTransaction();
        try {
            $timeSlot->forceDelete();

            CacheService::forget("institution:{$institutionId}:timeslot:{$id}:details");
            CacheService::forgetPattern("institution:{$institutionId}:timeslots*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Timeslot deleted permanently',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to delete timeslot', $e->getMessage());
        }
    }

    // private helper method
    private function errorResponse($message, $error = null, $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $error,
        ], $status);
    }
}
