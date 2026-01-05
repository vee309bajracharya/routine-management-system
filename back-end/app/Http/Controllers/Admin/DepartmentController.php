<?php

namespace App\Http\Controllers\Admin;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use App\Services\CacheService;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    private const DEPARTMENT_CACHE_TTL = 3600;

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * get all departments list with filters and pagination
     */
    public function index(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $cacheKey = "institution:{$institutionId}:departments:list:" . md5(json_encode(($request->query())));

            $departments = CacheService::remember($cacheKey, function () use ($institutionId, $request) {
                $query = Department::where('institution_id', $institutionId)
                    ->with([
                        'headTeacher:id,name',
                        'teachers',
                    ]);

                // filter (search by department name or code)
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('department_name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    });
                }

                // filter (status)
                if ($request->filled('status')) {
                    $query->where('status', $request->status);
                }

                // pagination, perPage = 5
                return $query->orderBy('department_name', 'asc')->paginate(5);
            }, self::DEPARTMENT_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Departments fetched successfully',
                'data' => $departments->map(function ($dept) {
                    return [
                        'id' => $dept->id,
                        'department_name' => $dept->department_name,
                        'description' => $dept->description,
                        'code' => $dept->code,
                        'head_teacher' => $dept->headTeacher ? [
                            'id' => $dept->headTeacher->id,
                            'name' => $dept->headTeacher->name,
                        ] : null,
                        'teachers_count' => $dept->teachers->count(),
                        'status' => $dept->status,
                    ];
                }),
                'pagination' => [
                    'current_page' => $departments->currentPage(),
                    'last_page' => $departments->lastPage(),
                    'per_page' => $departments->perPage(),
                    'total' => $departments->total(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch departments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * create new department
     */
    public function store(Request $request)
    {
        $institutionId = auth()->user()->institution_id;
        //validation
        $validator = Validator::make($request->all(), [
            'department_name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:departments,code',
            'head_teacher_id' => [
                'nullable',
                'exists:users,id',
                Rule::unique('departments')->where('institution_id', $institutionId)
            ],
            'description' => 'nullable|string|max:255',
            'status' => 'nullable|in:active,inactive',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'error' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();
            $institutionId = auth()->user()->institution_id;

            // verify teacher for HOD,
            if ($request->head_teacher_id) {
                $headTeacher = User::where('id', $request->head_teacher_id)
                    ->where('institution_id', $institutionId)
                    ->where('role', 'teacher')
                    ->first();

                if (!$headTeacher) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid head teacher selection',
                    ], 422);
                }
            }

            // create new department
            $department = Department::create([
                'institution_id' => $institutionId,
                'department_name' => $request->department_name,
                'code' => strtoupper($request->code),
                'description' => $request->description,
                'head_teacher_id' => $request->head_teacher_id,
                'status' => $request->status ?? 'active',
            ]);

            // cache clear
            CacheService::forget(CacheService::departmentsKey($institutionId));
            CacheService::forgetPattern("institution:{$institutionId}:departments:*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Department created successfully',
                'data' => [
                    'id' => $department->id,
                    'department_name' => $department->department_name,
                    'code' => $department->code,
                    'head_teacher' => $department->headTeacher ? [
                        'id' => $department->headTeacher->id,
                        'name' => $department->headTeacher->name,
                    ] : null,
                    'description' => $department->description,
                    'status' => $department->status,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create department',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * @param Request $request
     * @param mixed $id
     * @return \Illuminate\Http\JsonResponse
     * update any specific department details
     */
    public function update(Request $request, $id)
    {
        $institutionId = auth()->user()->institution_id;
        //valdiation
        $validator = Validator::make($request->all(), [
            'department_name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:departments,code,' . $id,
            'head_teacher_id' => [
                'nullable',
                'exists:users,id',
                Rule::unique('departments', 'head_teacher_id')->ignore($id)->where('institution_id', $institutionId)
            ],
            'description' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'error' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();
            $institutionId = auth()->user()->institution_id;
            $department = Department::where('institution_id', $institutionId)->findOrFail($id);

            // verify HOD
            if ($request->has('head_teacher_id') && $request->head_teacher_id) {
                $headTeacher = User::where('id', $request->head_teacher_id)
                    ->where('institution_id', $institutionId)
                    ->where('role', 'teacher')
                    ->first();

                if (!$headTeacher) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid head teacher selection'
                    ], 422);
                }
            }

            // update fields
            if ($request->has('department_name')) {
                $department->department_name = $request->department_name;
            }
            if ($request->has('code')) {
                $department->code = strtoupper($request->code);
            }
            if ($request->has('head_teacher_id')) {
                $department->head_teacher_id = $request->head_teacher_id;
            }
            if ($request->has('description')) {
                $department->description = $request->description;
            }
            if ($request->has('status')) {
                $department->status = $request->status;
            }
            $department->save();

            // cache clear
            CacheService::forget("department:{$id}:details");
            CacheService::forget(CacheService::departmentsKey($institutionId));
            CacheService::forgetPattern("institution:{$institutionId}:departments:*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Department updated successfully',
                'data' => [
                    'id' => $department->id,
                    'department_name' => $department->department_name,
                    'code' => $department->code,
                    'head_teacher' => $department->headTeacher ? [
                        'id' => $department->headTeacher->id,
                        'name' => $department->headTeacher->name,
                    ] : null,
                    'description' => $department->description,
                    'status' => $department->status,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update department',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * @param mixed $id
     * @return \Illuminate\Http\JsonResponse
     * delete department record permanently - no soft delete
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();
            $institutionId = auth()->user()->institution_id;
            $department = Department::where('institution_id', $institutionId)->withCount('academicYears')->findOrFail($id);

            // check if department has academic years
            if ($department->academic_years_count > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete department with associated academic years. Please remove associated academic year first',
                ], 422);
            }

            $department->forceDelete();

            // cache clear
            CacheService::forget("department:{$id}:details");
            CacheService::forget(CacheService::departmentsKey($institutionId));
            CacheService::forgetPattern("institution:{$institutionId}:departments:*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Department deleted permanently',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete department',
                'error' => $e->getMessage(),
            ], 500);
        }

    }
}
