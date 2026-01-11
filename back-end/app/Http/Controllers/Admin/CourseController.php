<?php

namespace App\Http\Controllers\Admin;

use App\Models\Course;
use Illuminate\Http\Request;
use App\Services\CacheService;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class CourseController extends Controller
{
    private const COURSE_CACHE_TTL = 3600;

    /**
     * Get all courses with filters and pagination
     * Filters: department_id, semester_id, course_type, status
     */
    public function index(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;

            $cacheKey = "institution:{$institutionId}:courses:list:" . md5(json_encode($request->query()));

            $courses = CacheService::remember($cacheKey, function () use ($institutionId, $request) {
                $query = Course::where('institution_id', $institutionId)
                    ->with([
                        'department:id,code',
                        'semester:id,semester_name',
                    ]);

                if ($request->filled('department_id'))
                    $query->where('department_id', $request->department_id);

                if ($request->filled('semester_id'))
                    $query->where('semester_id', $request->semester_id);

                if ($request->filled('course_type'))
                    $query->where('course_type', $request->course_type);

                if ($request->filled('status'))
                    $query->where('status', $request->status);

                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('course_name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    });
                }

                return $query
                    ->orderBy('semester_id')
                    ->orderBy('course_name')
                    ->paginate(10);
            }, self::COURSE_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Courses fetched successfully',
                'data' => $courses->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'course_name' => $course->course_name,
                        'code' => $course->code,
                        'description' => $course->description,
                        'course_type' => $course->course_type,
                        'status' => $course->status,

                        'department' => $course->department ? [
                            'id' => $course->department->id,
                            'code' => $course->department->code,
                        ] : null,

                        'semester' => $course->semester ? [
                            'id' => $course->semester->id,
                            'name' => $course->semester->semester_name,
                        ] : null,
                    ];
                }),

                'pagination' => [
                    'current_page' => $courses->currentPage(),
                    'last_page' => $courses->lastPage(),
                    'per_page' => $courses->perPage(),
                    'total' => $courses->total(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch courses', $e->getMessage());
        }
    }

    /**
     * Get single course details
     */
    public function show($id)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $cacheKey = "institution:{$institutionId}:course:{$id}:details";

            $course = CacheService::remember($cacheKey, function () use ($id, $institutionId) {
                return Course::where('institution_id', $institutionId)
                    ->with([
                        'department:id,code',
                        'semester:id,semester_name,academic_year_id',
                        'semester.academicYear:id,year_name',
                        'courseAssignments.teacher.user:id,name',
                        'courseAssignments.batch:id,batch_name,shift',
                    ])
                    ->findOrFail($id);
            }, self::COURSE_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Course fetched successfully',
                'data' => [
                    'id' => $course->id,
                    'course_name' => $course->course_name,
                    'code' => $course->code,
                    'description' => $course->description,
                    'course_type' => $course->course_type,
                    'status' => $course->status,

                    'department' => [
                        'id' => $course->department?->id,
                        'code' => $course->department?->code,
                    ],

                    'semester' => [
                        'id' => $course->semester?->id,
                        'name' => $course->semester?->semester_name,
                    ],

                    'academic_year' => [
                        'id' => $course->semester?->academicYear?->id,
                        'name' => $course->semester?->academicYear?->year_name,
                    ],

                    'course_assignments' => $course->courseAssignments->map(function ($assignment) {
                        return [
                            'id' => $assignment->id,
                            'teacher' => [
                                'id' => $assignment->teacher->id,
                                'name' => $assignment->teacher->user->name,
                            ],
                            'batch' => [
                                'id' => $assignment->batch->id,
                                'name' => $assignment->batch->batch_name,
                                'shift' => $assignment->batch->shift,
                            ],
                        ];
                    }),
                ]
            ], 200);
        } catch (\Exception $e) {
           return $this->errorResponse('Course not found', $e->getMessage(), 404);
        }
    }

    /**
     * Create new course
     */
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
            'course_name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('courses')->where('institution_id', $institutionId)
            ],
            'description' => 'nullable|string',
            'course_type' => 'required|in:Theory,Practical,Theory and Practical',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $course = Course::create([
                'institution_id' => $institutionId,
                'department_id' => $request->department_id,
                'semester_id' => $request->semester_id,
                'course_name' => $request->course_name,
                'code' => strtoupper($request->code),
                'description' => $request->description,
                'course_type' => $request->course_type,
                'status' => $request->status ?? 'active',
            ]);

            CacheService::forgetPattern("institution:{$institutionId}:courses*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Course created successfully',
                'data' => [
                    'id' => $course->id,
                    'course_name' => $course->course_name,
                    'code' => $course->code,
                    'description' => $course->description,
                    'course_type' => $course->course_type,
                    'status' => $course->status,
                    'department' => [
                        'id' => $course->department?->id,
                        'code' => $course->department?->code,
                    ],
                    'semester' => [
                        'id' => $course->semester?->id,
                        'semester_name' => $course->semester?->semester_name,
                    ],
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to create course', $e->getMessage());
        }
    }

    /**
     * Update course
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'course_name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:courses,code,' . $id,
            'description' => 'nullable|string',
            'course_type' => 'sometimes|in:Theory,Practical,Theory and Practical',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        $institutionId = auth()->user()->institution_id;
        $course = Course::where('institution_id', $institutionId)->findOrFail($id);
        DB::beginTransaction();
        try {
            $course->update($request->only([
                'course_name',
                'code',
                'description',
                'course_type',
                'status',
            ]));

            CacheService::forget("institution:{$institutionId}:course:{$id}:details");
            CacheService::forgetPattern("institution:{$institutionId}:courses*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Course updated successfully',
                'data' => [
                    'id' => $course->id,
                    'course_name' => $course->course_name,
                    'code' => $course->code,
                    'description' => $course->description,
                    'course_type' => $course->course_type,
                    'status' => $course->status,
                    'department' => [
                        'id' => $course->department?->id,
                        'code' => $course->department?->code,
                    ],
                    'semester' => [
                        'id' => $course->semester?->id,
                        'semester_name' => $course->semester?->semester_name,
                    ],
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to update course', $e->getMessage());
        }
    }

    // delete course
    public function destroy($id)
    {
        $institutionId = auth()->user()->institution_id;
        $course = Course::where('institution_id', $institutionId)->findOrFail($id);

        // Prevent deletion if the course is assigned to any batch
        if ($course->courseAssignments()->exists()) {
            return $this->errorResponse('Cannot delete course with active course assignments', null, 422);
        }

        DB::beginTransaction();
        try {
            $course->forceDelete();
            CacheService::forgetPattern("institution:{$institutionId}:courses*");
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Course deleted permanently'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to delete course', $e->getMessage());
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
