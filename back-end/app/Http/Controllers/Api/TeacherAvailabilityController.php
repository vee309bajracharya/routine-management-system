<?php

namespace App\Http\Controllers\Api;

use App\Models\Teacher;
use Illuminate\Http\Request;
use App\Services\CacheService;
use Illuminate\Support\Facades\DB;
use App\Models\TeacherAvailability;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class TeacherAvailabilityController extends Controller
{
    private const AVAILABILITY_CACHE_TTL = 3600;

    // index()
    /**
     * Get teachers list with availability
     */
    public function index(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;

            $cacheKey = "institution:{$institutionId}:teacher_availability:list:" . md5(json_encode($request->query()));

            $teachers = CacheService::remember($cacheKey, function () use ($institutionId, $request) {
                $query = Teacher::where('teachers.institution_id', $institutionId)
                    ->join('users', 'teachers.user_id', '=', 'users.id')
                    ->select('teachers.id', 'teachers.user_id', 'users.name')
                    ->with([
                        'availability' => function ($q) {
                            $q->orderByRaw("FIELD(day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')")
                                ->orderBy('available_from');
                        }
                    ]);

                if ($request->filled('search'))
                    $query->where('users.name', 'like', "%{$request->search}%");

                return $query->orderBy('users.name', 'asc')->paginate(10);
            }, self::AVAILABILITY_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Teachers and availability fetched successfully',
                'data' => $teachers->map(function ($teacher) {
                    return [
                        'teacher_id' => $teacher->id,
                        'teacher_name' => $teacher->name,
                        'availability_count' => $teacher->availability->count(),
                        'schedule' => $teacher->availability->map(fn($a) => $this->formatAvailability($a))
                    ];
                }),
                'pagination' => [
                    'current_page' => $teachers->currentPage(),
                    'last_page' => $teachers->lastPage(),
                    'per_page' => $teachers->perPage(),
                    'total' => $teachers->total(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch teachers', $e->getMessage());
        }
    }

    // store() - add Single or Bulk Days entries
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:teachers,id',
            'days' => 'required|array|min:1',
            'available_from' => 'required|date_format:H:i',
            'available_to' => 'required|date_format:H:i|after:available_from',
            'notes' => 'nullable|string|max:500',
        ]);
        if ($validator->fails())
            return $this->errorResponse('Validation failed', $validator->errors(), 422);

        $institutionId = auth()->user()->institution_id;
        $teacher = Teacher::with('user:id,name')->findOrFail($request->teacher_id);
        DB::beginTransaction();
        try {
            $createdEntries = [];

            foreach ($request->days as $day) {
                // Check for overlap on each specific day
                if ($this->hasOverlap($request->teacher_id, $day, $request->available_from, $request->available_to)) {
                    throw new \Exception("Overlap detected on {$day}. Please check existing schedule.");
                }
                $availability = TeacherAvailability::create([
                    'teacher_id' => $request->teacher_id,
                    'day_of_week' => $day,
                    'available_from' => $request->available_from,
                    'available_to' => $request->available_to,
                    'is_available' => true,
                    'notes' => $request->notes
                ]);
                $createdEntries[] = $this->formatAvailability($availability);
            }
            $this->clearCaches($institutionId, $request->teacher_id);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Availability saved successfully',
                'data' => [
                    'teacher_id' => $teacher->id,
                    'teacher_name' => $teacher->user->name,
                    'entries' => $createdEntries
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to save Availability entry', $e->getMessage());
        }
    }

    // update() - specific availability slot
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'available_from' => 'sometimes|required|date_format:H:i',
            'available_to' => 'sometimes|required|date_format:H:i|after:available_from',
            'is_available' => 'sometimes|boolean',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails())
            return $this->errorResponse('Validation failed', $validator->errors(), 422);

        $institutionId = auth()->user()->institution_id;
        DB::beginTransaction();
        try {
            $availability = TeacherAvailability::with('teacher.user:id,name')->findOrFail($id);
            $newFrom = $request->available_from ?? $availability->available_from->format('H:i');
            $newTo = $request->available_to ?? $availability->available_to->format('H:i');

            if ($this->hasOverlap($availability->teacher_id, $availability->day_of_week, $newFrom, $newTo, $id)) {
                return $this->errorResponse('This update causes a time overlap', null, 422);
            }

            $availability->update($request->only([
                'available_from',
                'available_to',
                'is_available',
                'notes'
            ]));
            $this->clearCaches($institutionId, $availability->teacher_id);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Availability slot updated successfully',
                'data' => [
                    'teacher_id' => $availability->teacher_id,
                    'teacher_name' => $availability->teacher->user->name,
                    'entry' => $this->formatAvailability($availability->fresh())
                ],
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to update Availability', $e->getMessage());
        }
    }

    // destroy() - delete the availability time
    public function destroy($id)
    {
        $availability = TeacherAvailability::findOrFail($id);
        $teacherId = $availability->teacher_id;
        $institutionId = auth()->user()->institution_id;

        DB::beginTransaction();
        try {
            $availability->forceDelete();
            $this->clearCaches($institutionId, $teacherId);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Availability deleted permanently'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to delete Availability time', $e->getMessage());
        }
    }


    // helper methods
    private function errorResponse($message, $error, $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $error,
        ], $status);
    }

    private function formatAvailability($avail)
    {
        return [
            'id' => $avail->id,
            'day_of_week' => $avail->day_of_week,
            'available_from' => $avail->available_from->format('H:i'),
            'available_to' => $avail->available_to->format('H:i'),
            'is_available' => (bool) $avail->is_available,
            'notes' => $avail->notes,
            'display_label' => "{$avail->day_of_week} (" . $avail->available_from->format('h:i A') . " - " . $avail->available_to->format('h:i A') . ")"
        ];
    }

    private function hasOverlap($teacherId, $day, $from, $to, $excludeId = null)
    {
        return TeacherAvailability::where('teacher_id', $teacherId)
            ->where('day_of_week', $day)
            ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
            ->where(function ($query) use ($from, $to) {
                $query->whereTime('available_from', '<', $to)
                    ->whereTime('available_to', '>', $from);
            })->exists();
    }

    private function clearCaches($institutionId, $teacherId)
    {
        CacheService::forget("teacher:{$teacherId}:availability");
        CacheService::forgetPattern("institution:{$institutionId}:teacher_availability:list:*");
    }

}
