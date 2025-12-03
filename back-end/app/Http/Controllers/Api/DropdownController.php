<?php

namespace App\Http\Controllers\Api;

use App\Models\AcademicYear;
use App\Models\Room;
use App\Models\Batch;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Semester;
use App\Models\TimeSlot;
use App\Models\Department;
use App\Models\CourseAssignment;
use Illuminate\Http\Request;
use App\Services\CacheService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class DropdownController extends Controller
{
    private const DROPDOWN_CACHE_TTL = 1800; //30mins

    /** Part 1 - Departments (independent)
     * get all departments based on an institution
     * /dropdowns/departments/1
     */
    public function getDepartments($institutionId)
    {
        try {
            $cacheKey = CacheService::departmentsKey($institutionId);

            $departments = CacheService::remember($cacheKey, function () use ($institutionId) {
                return Department::where('institution_id', $institutionId)
                    ->where('status', 'active')
                    ->select('id', 'department_name', 'code', 'description')
                    ->orderBy('department_name', 'asc')
                    ->get()
                    ->map(function ($dept) {
                        return [
                            'id' => $dept->id,
                            'department_name' => $dept->department_name,
                            'code' => $dept->code,
                            'description' => $dept->description,
                            'display_label' => $dept->code, //display in front-end as BCA, BBM
                        ];
                    });
            }, self::DROPDOWN_CACHE_TTL);

            return $this->successResponse($departments, 'Departments fetched successfully');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch departments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** Part 2 - Academic Years (filtered by department)
     * if 1st department is selected then /dropdowns/academic-years?department_id=1
     * to show the chosen department academic years
     */
    public function getAcademicYears(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $departmentId = $request->query('department_id'); //filter

            $cacheKey = "institution:{$institutionId}:academic_years";
            if ($departmentId)
                $cacheKey .= ":dept:{$departmentId}";

            $academicYears = CacheService::remember($cacheKey, function () use ($institutionId, $departmentId) {
                $query = AcademicYear::where('institution_id', $institutionId)
                    ->where('is_active', true);

                // if department_id is provided, ensure only selected department academic years are shown
                if ($departmentId) {
                    //filter via year_name
                    $query->where(function ($q) use ($departmentId) {
                        $dept = Department::find($departmentId);
                        if ($dept)
                            $q->where('year_name', 'like', $dept->code . '%');
                    });
                }

                return $query->select('id', 'year_name', 'start_date', 'end_date', 'is_active')
                    ->orderBy('start_date', 'desc')
                    ->get()
                    ->map(function ($year) {
                        return [
                            'id' => $year->id,
                            'year_name' => $year->year_name,
                            'start_date' => $year->start_date,
                            'end_date' => $year->end_date,
                            'is_active' => $year->is_active,
                            'display_label' => "{$year->year_name} ({$year->start_date->format('Y')} - {$year->end_date->format('Y')})" //display as : BCA-2022 (2022-2026)
                        ];
                    });
            }, self::DROPDOWN_CACHE_TTL);

            return $this->successResponse($academicYears, 'Academic Years fetched successfully');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch acadmeic years',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** Part 3 - Semesters (filtered by academic years)
     * get semesters for selected academic year
     * /dropdowns/semesters?academic_year_id=1
     */
    public function getSemesters(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'academic_year_id' => 'required|exists:academic_years,id'
            ]);
            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }
            $academicYearId = $request->query('academic_year_id');
            $cacheKey = "academic_year:{$academicYearId}:semesters";

            $semesters = CacheService::remember($cacheKey, function () use ($academicYearId) {
                return Semester::where('academic_year_id', $academicYearId)
                    ->where('is_active', true)
                    ->select('id', 'semester_name', 'semester_number', 'start_date', 'end_date')
                    ->orderBy('semester_number', 'asc')
                    ->get()
                    ->map(function ($semester) {
                        return [
                            'id' => $semester->id,
                            'semester_name' => $semester->semester_name,
                            'semester_number' => $semester->semester_number,
                            'start_date' => $semester->start_date->format('Y-m-d'),
                            'end_date' => $semester->end_date->format('Y-m-d'),
                            'display_label' => "{$semester->semester_name} ({$semester->start_date->format('M Y')} - {$semester->end_date->format('M Y')})" //Seventh Semester (Aug 2024 - Feb 2025)
                        ];
                    });
            }, self::DROPDOWN_CACHE_TTL);
            return $this->successResponse($semesters, 'Semesters fetched successfully');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch semesters',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** Part 4 - Batch (filtered by department and semester)
     * get batches filtered by department and semester
     * shows which 'shift' - Morning or Day
     * /dropdowns/batches?department_id=1&semester_id=1
     */
    public function getBatches(Request $request)
    {
        try {
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

                if ($departmentId)
                    $query->where('department_id', $departmentId);

                if ($semesterId)
                    $query->where('semester_id', $semesterId);

                return $query->with('department:id,department_name')
                    ->select('id', 'batch_name', 'code', 'year_level', 'shift', 'department_id')
                    ->orderBy('year_level', 'desc')
                    ->orderBy('shift', 'asc')
                    ->get()
                    ->map(function ($batch) {
                        return [
                            'id' => $batch->id,
                            'batch_name' => $batch->batch_name,
                            'code' => $batch->code,
                            'year_level' => $batch->year_level,
                            'shift' => $batch->shift,
                            'department' => $batch->department ? [
                                'id' => $batch->department->id,
                                'name' => $batch->department->department_name
                            ] : null,
                            'display_label' => "{$batch->batch_name} ({$batch->shift} Shift)"
                        ];
                    });
            }, self::DROPDOWN_CACHE_TTL);

            return $this->successResponse($batches, 'Batches fetched successfully');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch batches',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** Part 5 - Course Assignments (filtered by batch + semester + department)
     *  /dropdowns/course-assignments?semester_id=1&batch_id=1&department_id=1
     */
    public function getCourseAssignments(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'semester_id' => 'required|exists:semesters,id',
                'batch_id' => 'required|exists:batches,id',
            ]);
            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }
            $semesterId = $request->query('semester_id');
            $batchId = $request->query('batch_id');
            $departmentId = $request->query('department_id');

            $cacheKey = CacheService::courseAssignmentsKey($semesterId, $batchId);
            if ($departmentId)
                $cacheKey .= ":dept:{$departmentId}";

            $assignments = CacheService::remember($cacheKey, function () use ($semesterId, $batchId, $departmentId) {
                $query = CourseAssignment::where('semester_id', $semesterId)
                    ->where('batch_id', $batchId)
                    ->where('status', 'active')
                    ->with([
                        'course:id,course_name,code',
                        'teacher.user:id,name',
                        'teacher.department:id,code',
                        'batch:id,batch_name,code,shift',
                    ]);
                if ($departmentId) {
                    $query->whereHas('teacher', function ($q) use ($departmentId) {
                        $q->where('department_id', $departmentId);
                    });
                }
                return $query->get()->map(function ($assignment) {
                    return [
                        'id' => $assignment->id,
                        'course' => [
                            'id' => $assignment->course->id,
                            'course_name' => $assignment->course->course_name,
                            'code' => $assignment->course->code,
                        ],
                        'teacher' => [
                            'id' => $assignment->teacher->id,
                            'name' => $assignment->teacher->user->name,
                            'department_code' => $assignment->teacher->department->code ?? 'N/A',
                        ],
                        'batch' => [
                            'id' => $assignment->batch->id,
                            'name' => $assignment->batch->batch_name,
                            'shift' => $assignment->batch->shift,
                        ],
                        'display_label' => "{$assignment->course->course_name} - {$assignment->teacher->user->name}",
                    ];
                });
            }, self::DROPDOWN_CACHE_TTL);
            return $this->successResponse($assignments, 'Course Assignments fetched successfully');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch course assignments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** Part 6 - Timeslots (filtered by batch + semester)
     * as diff. batches have diff. schedules
     * 1st year vs 4th year have diff. time_slots
     * dropdowns/time-slots?batch_id=1&semester_id=1
     */
    public function getTimeSlots(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $batchId = $request->query('batch_id');
            $semesterId = $request->query('semester_id');

            $validator = Validator::make($request->all(), [
                'batch_id' => 'required|exists:batches,id',
                'semester_id' => 'required|exists:semesters,id'
            ]);
            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $cacheKey = CacheService::timeSlotsKey($institutionId);
            if ($batchId)
                $cacheKey .= ":batch:{$batchId}";
            if ($semesterId)
                $cacheKey .= ":semester:{$semesterId}";

            $timeSlots = CacheService::remember($cacheKey, function () use ($institutionId, $batchId, $semesterId) {
                $query = TimeSlot::where('institution_id', $institutionId)
                    ->where('is_active', true);
                if ($batchId)
                    $query->where('batch_id', $batchId);
                if ($semesterId)
                    $query->where('semester_id', $semesterId);
                return $query->select('id', 'name', 'start_time', 'end_time')
                    ->orderBy('start_time', 'asc')
                    ->get()
                    ->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'name' => $slot->name,
                            'start_time' => $slot->start_time->format('H:i'),
                            'end_time' => $slot->end_time->format('H:i'),
                            'display_label' => "{$slot->start_time->format('H:i')} - {$slot->end_time->format('H:i')} ({$slot->name})"
                        ];
                    });
            }, self::DROPDOWN_CACHE_TTL);
            return $this->successResponse($timeSlots, 'Time slots fetched successfully');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch time slots',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** Part 7 - Teachers (filtered by department)
     * /dropdowns/teachers?department_id=1
     */
    public function getTeachers(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $departmentId = $request->query('department_id');

            $cacheKey = "institution:{$institutionId}:teachers";
            if ($departmentId)
                $cacheKey .= ":dept:{$departmentId}";

            $teachers = CacheService::remember($cacheKey, function () use ($institutionId, $departmentId) {
                $query = Teacher::where('institution_id', $institutionId)
                    ->with([
                        'user:id,name',
                        'department:id,department_name,code',
                    ]);

                if ($departmentId)
                    $query->where('department_id', $departmentId);

                return $query->get()->map(function ($teacher) {
                    return [
                        'id' => $teacher->id,
                        'user_id' => $teacher->user_id,
                        'name' => $teacher->user->name,
                        'department' => $teacher->department ? [
                            'id' => $teacher->department->id,
                            'name' => $teacher->department->department_name,
                            'code' => $teacher->department->code,
                        ] : null,
                        'employment_type' => $teacher->employment_type,
                        'display_label' => $teacher->user->name . ' (' . ($teacher->department ? $teacher->department->code : 'N/A') . ')'
                    ];
                });
            }, self::DROPDOWN_CACHE_TTL);

            return $this->successResponse($teachers, 'Teachers fetched successfully');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch teachers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** Part 8 - Courses (filtered by department and semesters)
     * /dropdowns/courses?department_id=1&semester_id=1
     * fetch courses related to selected semester
     */
    public function getCourses(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $departmentId = $request->query('department_id');
            $semesterId = $request->query('semester_id');

            $validator = Validator::make($request->all(), [
                'department_id' => 'required|exists:departments,id',
                'semester_id' => 'required|exists:semesters,id',
            ]);
            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $cacheKey = "institution:{$institutionId}:courses";
            if ($departmentId)
                $cacheKey .= ":dept:{$departmentId}";
            if ($semesterId)
                $cacheKey .= ".sem:{$semesterId}";

            $courses = CacheService::remember($cacheKey, function () use ($institutionId, $departmentId, $semesterId) {
                $query = Course::where('institution_id', $institutionId)
                    ->where('status', 'active');
                if ($departmentId)
                    $query->where('department_id', $departmentId);
                if ($semesterId) {
                    $semester = Semester::find($semesterId);
                    if ($semester)
                        $query->where('semester_number', $semester->semester_number);
                }
                return $query->select('id', 'course_name', 'code', 'semester_number')
                    ->orderBy('course_name', 'asc')
                    ->get()
                    ->map(function ($course) {
                        return [
                            'id' => $course->id,
                            'course_name' => $course->course_name,
                            'course_code' => $course->code,
                            'semester_number' => $course->semester_number,
                            'display_label' => "{$course->course_name} ({$course->code})"
                        ];
                    });
            }, self::DROPDOWN_CACHE_TTL);
            return $this->successResponse($courses, 'Courses fetched successfully');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch courses',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** Part 9 - Rooms 
     * get all available rooms
     * if room is already booked, won't be shown in dropdown
     */
    public function getRooms(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $roomType = $request->query('room_type');

            $cacheKey = CacheService::roomsKey($institutionId, $roomType);
            $rooms = CacheService::remember($cacheKey, function () use ($institutionId, $roomType) {
                $query = Room::where('institution_id', $institutionId)
                    ->where('status', 'active');
                if ($roomType)
                    return $query->where('room_type', $roomType);
                return $query->select('id', 'name', 'room_number', 'room_type')
                    ->orderBy('room_number', 'asc')
                    ->get()
                    ->map(function ($room) {
                        return [
                            'id' => $room->id,
                            'name' => $room->name,
                            'room_number' => $room->room_number,
                            'room_type' => $room->room_type,
                            'display_label' => "{$room->name} ({$room->room_type})"
                        ];
                    });
            }, self::DROPDOWN_CACHE_TTL);
            return $this->successResponse($rooms, 'Rooms fetched successfully');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch rooms',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ===========================================================================================

    // Response Helper Methods
    private function successResponse($data, $message)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], 200);
    }

    private function validationError($errors)
    {
        return response()->json([
            'status' => false,
            'message' => 'Validation error',
            'errors' => $errors
        ], 422);
    }

}
