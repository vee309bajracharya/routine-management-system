<?php

namespace App\Http\Controllers\Api;

use App\Models\Room;
use App\Models\Batch;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Semester;
use App\Models\TimeSlot;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Services\CacheService;
use App\Models\CourseAssignment;
use App\Http\Controllers\Controller;

class DropdownController extends Controller
{
    // TTL for 30mins, as dropdowns don't change frequently
    private const DROPDOWN_CACHE_TTL = 1800;

    // get all departments for an institution in routine creation and filters
    public function getDepartments($institutionId)
    {
        try {
            $cacheKey = CacheService::departmentsKey($institutionId); //cache key for specific institution's department

            //initially from cache, if not from DB
            $departments = CacheService::remember($cacheKey, function () use ($institutionId) {
                return Department::where('institution_id', $institutionId)
                    ->where('status', 'active')
                    ->select('id', 'department_name', 'code')
                    ->orderBy('department_name', 'asc')
                    ->get();
            }, self::DROPDOWN_CACHE_TTL);

            return response()->json([
                'success' => true,
                'data' => $departments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch departments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // get all semesters for an academic year
    public function getSemesters(Request $request)
    {
        try {
            //academic_year_id from query param
            $academicYearId = $request->query('academic_year_id');
            if (!$academicYearId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Academic year id is required',
                ], 422);
            }

            $cacheKey = "academic_year:{$academicYearId}:semesters";

            $semesters = CacheService::remember($cacheKey, function () use ($academicYearId) {
                return Semester::where('academic_year_id', $academicYearId)
                    ->where('is_active', true)
                    ->select('id', 'semester_name', 'semester_number', 'start_date', 'end_date')
                    ->orderBy('semester_number', 'asc')
                    ->get();
            }, self::DROPDOWN_CACHE_TTL);

            return response()->json([
                'success' => true,
                'data' => $semesters
            ], 200);
        } catch (\Exception $th) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch semesters'
            ], 500);
        }
    }

    // get batches
    public function getBatches(Request $request)
    {
        try {
            //from query params
            $institutionId = auth()->user()->institution_id;
            $departmentId = $request->query('department_id');
            $semesterId = $request->query('semester_id');
            $status = $request->query('status', 'active');

            $cacheKey = CacheService::batchesKey($institutionId, $departmentId);
            if ($semesterId)
                $cacheKey .= ":semester:{$semesterId}";

            $batches = CacheService::remember($cacheKey, function () use ($institutionId, $departmentId, $semesterId, $status) {
                $query = Batch::where('institution_id', $institutionId)
                    ->where('status', $status);

                //Apply department filter if provided
                if ($departmentId)
                    $query->where('department_id', $departmentId);

                // Apply semester filter if provided
                if ($semesterId)
                    $query->where('semester_id', $semesterId);


                // Load department relationship for display
                return $query->with('department:id,department_name')
                    ->select('id', 'batch_name', 'code', 'year_level', 'shift', 'department_id')
                    ->orderBy('year_level', 'desc') // Recent batches first
                    ->orderBy('batch_name', 'asc')
                    ->get();
            }, self::DROPDOWN_CACHE_TTL);

            return response()->json([
                'success' => 'true',
                'data' => $batches
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch batches'
            ], 500);
        }
    }

    //get courses
    public function getCourses(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $departmentId = $request->query('department_id');
            $semesterNumber = $request->query('semester_number');

            $cacheKey = "institution:{$institutionId}:courses";
            if ($departmentId)
                $cacheKey .= ":dept:{$departmentId}";
            if ($semesterNumber)
                $cacheKey .= ":sem:{$semesterNumber}";

            $courses = CacheService::remember($cacheKey, function () use ($institutionId, $departmentId, $semesterNumber) {
                $query = Course::where('institution_id', $institutionId)
                    ->where('status', 'active');

                // Apply filters if provided
                if ($departmentId) {
                    $query->where('department_id', $departmentId);
                }

                if ($semesterNumber) {
                    $query->where('semester_number', $semesterNumber);
                }

                return $query->with('department:id,department_name')
                    ->select('id', 'course_name', 'code', 'course_type', 'semester_number', 'department_id')
                    ->orderBy('course_name', 'asc')
                    ->get();
            }, self::DROPDOWN_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => $courses,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch courses'
            ], 500);
        }
    }

    //get course assignments
    public function getCourseAssignments(Request $request)
    {
        try {
            //semester is required as assignements are sem-specific
            $semesterId = $request->query('semester_id');
            if (!$semesterId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Semester id is required',
                ], 422);
            }
            $batchId = $request->query('batch_id');
            $departmentId = $request->query('department_id');

            $cacheKey = CacheService::courseAssignmentsKey($semesterId, $batchId);
            if ($departmentId)
                $cacheKey .= ":dept:{$departmentId}";

            $assignments = CacheService::remember($cacheKey, function () use ($semesterId, $batchId, $departmentId) {
                $query = CourseAssignment::where('semester_id', $semesterId)
                    ->where('status', 'active');

                // Apply batch filter
                if ($batchId)
                    $query->where('batch_id', $batchId);

                // Load all necessary relationships for dropdown display
                $query->with([
                    'course:id,course_name,code,course_type', // Course details
                    'teacher.user:id,name', // Teacher name through user relationship
                    'teacher.department:id,department_name', // Teacher's department
                    'batch:id,batch_name,code', // Batch details
                ]);
                // Apply department filter if provided
                if ($departmentId) {
                    // Filter by teacher's department
                    $query->whereHas('teacher', function ($q) use ($departmentId) {
                        $q->where('department_id', $departmentId);
                    });
                }

                $results = $query->get();

                // Transform data
                return $results->map(function ($assignment) {
                    return [
                        'id' => $assignment->id, // for creating entry
                        'course_id' => $assignment->course_id,
                        'course_name' => $assignment->course->course_name,
                        'course_code' => $assignment->course->code,
                        'course_type' => $assignment->course->course_type,
                        'teacher_id' => $assignment->teacher_id,
                        'teacher_name' => $assignment->teacher->user->name,
                        'teacher_department' => $assignment->teacher->department->department_name ?? 'N/A',
                        'batch_id' => $assignment->batch_id,
                        'batch_name' => $assignment->batch->batch_name,
                        'batch_code' => $assignment->batch->code,
                        'assignment_type' => $assignment->assignment_type,
                        // Display label for dropdown: "Course Name - Teacher Name (Batch)"
                        'display_label' => "{$assignment->course->course_name} - {$assignment->teacher->user->name} ({$assignment->batch->batch_name})"
                    ];
                });
            }, self::DROPDOWN_CACHE_TTL);

            return response()->json([
                'success' => true,
                'data' => $assignments
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch course assignments'
            ], 500);
        }
    }

    // ====
    /**
     * Get teachers with optional department filter
     * Used in: Teacher selection dropdowns
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTeachers(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $departmentId = $request->query('department_id');
            $employmentType = $request->query('employment_type');

            // Cache key
            $cacheKey = "institution:{$institutionId}:teachers";
            if ($departmentId)
                $cacheKey .= ":dept:{$departmentId}";
            if ($employmentType)
                $cacheKey .= ":type:{$employmentType}";

            $teachers = CacheService::remember($cacheKey, function () use ($institutionId, $departmentId, $employmentType) {
                $query = Teacher::where('institution_id', $institutionId);

                // Apply filters
                if ($departmentId) {
                    $query->where('department_id', $departmentId);
                }

                if ($employmentType) {
                    $query->where('employment_type', $employmentType);
                }

                // Load relationships
                return $query->with([
                    'user:id,name', // User details
                    'department:id,department_name' // Department name
                ])
                    ->get()
                    ->map(function ($teacher) {
                        return [
                            'id' => $teacher->id,
                            'user_id' => $teacher->user_id,
                            'name' => $teacher->user->name,
                            'department' => $teacher->department->department_name ?? 'N/A',
                            'employment_type' => $teacher->employment_type,
                        ];
                    });
            }, self::DROPDOWN_CACHE_TTL);

            return response()->json([
                'success' => true,
                'data' => $teachers
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch teachers'
            ], 500);
        }
    }

    /**
     * Get rooms with optional filters
     * Used in: Room selection in entry forms
     * Filters: room_type (classroom, lab, lecture_hall, etc.)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRooms(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $roomType = $request->query('room_type');
            $building = $request->query('building');

            // Cache key
            $cacheKey = CacheService::roomsKey($institutionId, $roomType);
            if ($building)
                $cacheKey .= ":building:{$building}";

            $rooms = CacheService::remember($cacheKey, function () use ($institutionId, $roomType, $building) {
                $query = Room::where('institution_id', $institutionId)
                    ->where('status', 'active') // Only active rooms
                    ->where('is_available', true); // Only available rooms

                // Apply filters
                if ($roomType) {
                    $query->where('room_type', $roomType);
                }

                if ($building) {
                    $query->where('building', $building);
                }

                return $query->select('id', 'name', 'room_number', 'building', 'room_type')
                    ->orderBy('room_type', 'asc') // Group by type
                    ->orderBy('room_number', 'asc') // Then by number
                    ->get();
            }, self::DROPDOWN_CACHE_TTL);

            return response()->json([
                'success' => true,
                'data' => $rooms
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch rooms'
            ], 500);
        }
    }

    /**
     * Get time slots for an institution
     * Used in: Time slot selection, grid headers
     * Can filter by slot_type (lecture, break, practical)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTimeSlots(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $slotType = $request->query('slot_type'); // lecture, break, practical

            // Cache key
            $cacheKey = CacheService::timeSlotsKey($institutionId);
            if ($slotType)
                $cacheKey .= ":type:{$slotType}";

            $timeSlots = CacheService::remember($cacheKey, function () use ($institutionId, $slotType) {
                $query = TimeSlot::where('institution_id', $institutionId)
                    ->where('is_active', true);

                // Filter by type if provided
                if ($slotType) {
                    $query->where('slot_type', $slotType);
                }

                return $query->select('id', 'name', 'start_time', 'end_time', 'duration_minutes', 'slot_type', 'slot_order', 'applicable_days')
                    ->orderBy('slot_order', 'asc') // Order by slot_order for correct sequence
                    ->get()
                    ->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'name' => $slot->name,
                            'start_time' => $slot->start_time->format('H:i'), // Format time as HH:MM
                            'end_time' => $slot->end_time->format('H:i'),
                            'duration_minutes' => $slot->duration_minutes,
                            'slot_type' => $slot->slot_type,
                            'slot_order' => $slot->slot_order,
                            'applicable_days' => $slot->applicable_days,
                            //'time_range' => $slot->time_range, // Uses accessor from model
                        ];
                    });
            }, self::DROPDOWN_CACHE_TTL);

            return response()->json([
                'success' => true,
                'data' => $timeSlots
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch time slots'
            ], 500);
        }
    }

    /**
     * Get all dropdown data at once (combined endpoint)
     * This reduces frontend API calls - single request gets all dropdowns
     * Used in: Form initialization where multiple dropdowns are needed
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    // public function getAllDropdowns()
    // {
    //     try {
    //         $institutionId = auth()->user()->institution_id;

    //         // Generate combined cache key
    //         $cacheKey = "institution:{$institutionId}:all_dropdowns";

    //         $dropdowns = CacheService::remember($cacheKey, function () use ($institutionId) {
    //             return [
    //                 // Get all basic dropdown data
    //                 'departments' => Department::where('institution_id', $institutionId)
    //                     ->where('status', 'active')
    //                     ->select('id', 'department_name', 'code')
    //                     ->orderBy('department_name')
    //                     ->get(),

    //                 'rooms' => Room::where('institution_id', $institutionId)
    //                     ->where('status', 'active')
    //                     ->where('is_available', true)
    //                     ->select('id', 'name', 'room_number', 'building', 'room_type')
    //                     ->orderBy('room_type')
    //                     ->orderBy('room_number')
    //                     ->get(),

    //                 'time_slots' => TimeSlot::where('institution_id', $institutionId)
    //                     ->where('is_active', true)
    //                     ->select('id', 'name', 'start_time', 'end_time', 'slot_type', 'slot_order')
    //                     ->orderBy('slot_order')
    //                     ->get()
    //                     ->map(function ($slot) {
    //                         $slot->start_time = $slot->start_time->format('H:i');
    //                         $slot->end_time = $slot->end_time->format('H:i');
    //                         return $slot;
    //                     }),
    //             ];
    //         }, self::DROPDOWN_CACHE_TTL);

    //         return response()->json([
    //             'success' => true,
    //             'data' => $dropdowns
    //         ], 200);

    //     } catch (\Exception $e) {

    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to fetch dropdown data'
    //         ], 500);
    //     }
    // }


}
