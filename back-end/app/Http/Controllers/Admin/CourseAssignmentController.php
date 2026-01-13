<?php

namespace App\Http\Controllers\Admin;

use App\Models\Teacher;
use Illuminate\Http\Request;
use App\Services\CacheService;
use Illuminate\Validation\Rule;
use App\Models\CourseAssignment;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class CourseAssignmentController extends Controller
{
    private const COURSEASSIGNMENT_CACHE_TTL = 3600;

    // get all course assignments list

    public function index(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;

            $cacheKey = "institution:{$institutionId}:course_assignments:list:" . md5(json_encode($request->query()));

            $assignments = CacheService::remember($cacheKey, function () use ($institutionId, $request) {
                $query = CourseAssignment::whereHas('course', function ($q) use ($institutionId) {

                })
                    ->with([
                        'course:id,course_name',
                        'teacher.user:id,name',
                        'semester:id,semester_name',
                        'batch:id,batch_name',
                    ]);

                // Filter by status
                if ($request->filled('status')) {
                    $query->where('status', $request->status);
                }

                //Search by Course,Teacher, Semester or Batch Name
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->whereHas('course', fn($courseQuery) => $courseQuery->where('course_name', 'like', "%{$search}%"))
                            ->orWhereHas('teacher.user', fn($userQuery) => $userQuery->where('name', 'like', "%{$search}%"))
                            ->orWhereHas('semester', fn($semesterQuery) => $semesterQuery->where('semester_name', 'like', "%{$search}%"))
                            ->orWhereHas('batch', fn($batchQuery) => $batchQuery->where('batch_name', 'like', "%{$search}%"));
                    });
                }

                return $query->orderBy('created_at', 'desc')
                    ->paginate(10);
            }, self::COURSEASSIGNMENT_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Course Assignments fetched successfully',
                'data' => $assignments->map(function ($assignment) {
                    return [
                        // primary
                        'id' => $assignment->id,
                        'status' => $assignment->status,
                        'notes' => $assignment->notes,
                        'created_at' => $assignment->created_at->format('Y-m-d H:i'),
                        // secondary
                        'course' => [
                            'id' => $assignment->course->id,
                            'name' => $assignment->course->course_name,
                        ],
                        'teacher' => [
                            'id' => $assignment->teacher->id,
                            'name' => $assignment->teacher->user->name,
                        ],
                        'batch' => [
                            'id' => $assignment->batch->id,
                            'name' => $assignment->batch->batch_name,
                        ],
                        'semester' => [
                            'id' => $assignment->semester->id,
                            'name' => $assignment->semester->semester_name,
                        ],
                    ];
                }),
                'pagination' => [
                    'current_page' => $assignments->currentPage(),
                    'last_page' => $assignments->lastPage(),
                    'per_page' => $assignments->perPage(),
                    'total' => $assignments->total(),
                ],
            ], 200);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch Course Assignments', $e->getMessage());
        }
    }

    // get single course assignment details
    public function show($id)
    {
        try {
            $institutionId = auth()->user()->institution_id;

            $cacheKey = "course_assignment:{$id}:details";

            $assignment = CacheService::remember($cacheKey, function () use ($id, $institutionId) {
                return CourseAssignment::whereHas('course', function ($q) use ($institutionId) {
                    $q->where('institution_id', $institutionId);
                })
                    ->with([
                        'course:id,course_name,code',
                        'teacher.user:id,name',
                        'teacher.department:id,code',
                        'department:id,department_name,code',
                        'semester:id,semester_name',
                        'batch:id,batch_name,shift',
                    ])
                    ->findOrFail($id);
            }, self::COURSEASSIGNMENT_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Course Assignment fetched successfully',
                'data' => [
                    'id' => $assignment->id,
                    'assignment_type' => $assignment->assignment_type,
                    'status' => $assignment->status,
                    'notes' => $assignment->notes,
                    'created_at' => $assignment->created_at->format('Y-m-d H:i:s'),
                    'course' => [
                        'id' => $assignment->course->id,
                        'name' => $assignment->course->course_name,
                        'code' => $assignment->course->code,
                    ],
                    'teacher' => [
                        'id' => $assignment->teacher->id,
                        'name' => $assignment->teacher->user->name,
                        // teacher's associated department detail
                        'department' => [
                            'id' => $assignment->teacher->department->id,
                            'code' => $assignment->teacher->department->code,
                        ],
                    ],
                    // course department
                    'department' => [
                        'id' => $assignment->department->id,
                        'name' => $assignment->department->department_name,
                        'code' => $assignment->department->code,
                    ],
                    'semester' => [
                        'id' => $assignment->semester->id,
                        'name' => $assignment->semester->semester_name,
                    ],
                    'batch' => [
                        'id' => $assignment->batch->id,
                        'name' => $assignment->batch->batch_name,
                        'shift' => $assignment->batch->shift,
                    ],
                ]
            ], 200);
        } catch (\Exception $e) {
            return $this->errorResponse('Course Assignment not found', $e->getMessage(), 404);
        }
    }

    // create new course assignment
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
            'course_id' => [
                'required',
                Rule::exists('courses', 'id')->where('institution_id', $institutionId)
            ],
            'teacher_id' => [
                'required',
                Rule::exists('teachers', 'id')->where('institution_id', $institutionId)
            ],
            'status' => 'nullable|in:active,completed,cancelled',
            'notes' => 'nullable|string|max:500',
        ]);
        if ($validator->fails())
            return $this->errorResponse('Validation failed', $validator->errors(), 422);

        // check for duplicate assignment (unique constraint)
        $duplicate = CourseAssignment::where('course_id', $request->course_id)
            ->where('batch_id', $request->batch_id)
            ->where('semester_id', $request->semester_id)
            ->where('assignment_type', $request->assignment_type)
            ->exists();

        if ($duplicate)
            return $this->errorResponse('Course is already assigned to this batch, semester with the same assignment type', null, 422);

        DB::beginTransaction();
        try {
            $assignment = CourseAssignment::create([
                'course_id' => $request->course_id,
                'teacher_id' => $request->teacher_id,
                'batch_id' => $request->batch_id,
                'semester_id' => $request->semester_id,
                'department_id' => $request->department_id,
                'assignment_type' => $request->assignment_type ?? 'Theory',
                'status' => $request->status ?? 'active',
                'notes' => $request->notes,
            ]);

            $semesterId = $request->semester_id;
            $batchId = $request->batch_id;
            //cache clear
            CacheService::forgetPattern("institution:{$institutionId}:course_assignments*");
            CacheService::forget(CacheService::courseAssignmentsKey($semesterId, $batchId));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Course Assignment created successfully',
                'data' => [
                    'id' => $assignment->id,
                    'assignment_type' => $assignment->assignment_type,
                    'status' => $assignment->status,
                    'course' => [
                        'id' => $assignment->course->id,
                        'name' => $assignment->course->course_name,
                    ],
                    'teacher' => [
                        'id' => $assignment->teacher->id,
                        'name' => $assignment->teacher->user->name,
                    ],
                    'batch' => [
                        'id' => $assignment->batch->id,
                        'name' => $assignment->batch->batch_name,
                    ],
                    'semester' => [
                        'id' => $assignment->semester->id,
                        'name' => $assignment->semester->semester_name,
                    ],
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to create Course Assignment', $e->getMessage());
        }
    }

    // update course assignment
    public function update(Request $request, $id)
    {
        $institutionId = auth()->user()->institution_id;
        $validator = Validator::make($request->all(), [
            'course_id'=> 'sometimes|exists:courses,id',
            'teacher_id'=> 'sometimes|exists:teachers,id',
            'assignment_type' => 'sometimes|in:Theory,Practical,Theory and Practical',
            'status' => 'sometimes|in:active,cancelled',
            'notes' => 'nullable|string|max:500',
        ]);
        if ($validator->fails())
            return $this->errorResponse('Validation failed', $validator->errors(), 422);

        $assignment = CourseAssignment::whereHas('course', function ($q) use ($institutionId) {
            $q->where('institution_id', $institutionId);
        })->findOrFail($id);

        // Verify teacher if provided
        if ($request->has('teacher_id')) {
            $teacher = Teacher::where('id', $request->teacher_id)
                ->where('institution_id', $institutionId)
                ->first();

            if (!$teacher)
                return $this->errorResponse('Invalid teacher selection', null, 422);
        }

        // Check for duplicate if assignment_type is being changed
        if ($request->has('assignment_type') && $request->assignment_type != $assignment->assignment_type) {
            $duplicate = CourseAssignment::where('course_id', $assignment->course_id)
                ->where('batch_id', $assignment->batch_id)
                ->where('semester_id', $assignment->semester_id)
                ->where('assignment_type', $request->assignment_type)
                ->where('id', '!=', $id)
                ->exists();

            if ($duplicate)
                return $this->errorResponse('Course is already assigned with the same assignment type', null, 422);
        }

        DB::beginTransaction();
        try {
            $assignment->update($request->only([
                'course_id',
                'teacher_id',
                'assignment_type',
                'status',
                'notes',
            ]));

            $semesterId = $assignment->semester_id;
            $batchId = $assignment->batch_id;
            // cache clear
            CacheService::forget("course_assignment:{$id}:details");
            CacheService::forgetPattern("institution:{$institutionId}:course_assignments*");
            CacheService::forget(CacheService::courseAssignmentsKey($semesterId, $batchId));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Course Assignment updated successfully',
                'data' => [
                    'id' => $assignment->id,
                    'course' => [
                        'id' => $assignment->course->id,
                        'name' => $assignment->course->course_name,
                    ],
                    'teacher' => [
                        'id' => $assignment->teacher->id,
                        'name' => $assignment->teacher->user->name,
                    ],
                    'assignment_type' => $assignment->assignment_type,
                    'status' => $assignment->status,
                    'notes' => $assignment->notes,

                    // secondary
                    'department' => [
                        'id' => $assignment->department->id,
                        'name' => $assignment->department->department_name,
                        'code' => $assignment->department->code,
                    ],
                    'semester' => [
                        'id' => $assignment->semester->id,
                        'name' => $assignment->semester->semester_name,
                    ],
                    'batch' => [
                        'id' => $assignment->batch->id,
                        'name' => $assignment->batch->batch_name,
                    ],
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to update Course Assignment', $e->getMessage());
        }
    }

    // delete course assignment
    public function destroy($id)
    {
        $institutionId = auth()->user()->institution_id;
        $assignment = CourseAssignment::whereHas('course', function ($q) use ($institutionId) {
            $q->where('institution_id', $institutionId);
        })->findOrFail($id);

        DB::beginTransaction();
        try {
            $assignment->forceDelete();

            $semesterId = $assignment->semester_id;
            $batchId = $assignment->batch_id;

            // cache clear
            CacheService::forget("course_assignment:{$id}:details");
            CacheService::forgetPattern("institution:{$institutionId}:course_assignments*");
            CacheService::forget(CacheService::courseAssignmentsKey($semesterId, $batchId));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Course Assignment deleted permanently',
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to delete Course Assignment', $e->getMessage());
        }
    }

    // private helper method
    private function errorResponse($message, $error, $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $error,
        ], $status);
    }
}
