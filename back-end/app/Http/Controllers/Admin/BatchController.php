<?php

namespace App\Http\Controllers\Admin;

use App\Models\Batch;
use App\Models\Semester;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Services\CacheService;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class BatchController extends Controller
{
    private const BATCHES_CACHE_TTL = 3600;
    /**
     *  list all batches
     * filtered by department_id, semester_id, shift
     */
    public function index(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;

            $cacheKey = "institution:{$institutionId}:batches:list:" . md5(json_encode($request->query()));

            $batches = CacheService::remember($cacheKey, function () use ($institutionId, $request) {
                $query = Batch::where('institution_id', $institutionId)
                    ->with([
                        'department:id,code',
                        'semester:id,semester_name'
                    ]);

                // filter by department
                if ($request->filled('department_id'))
                    $query->where('department_id', $request->department_id);

                // filter by semester
                if ($request->filled('semester_id'))
                    $query->where('semester_id', $request->semester_id);

                // filter by shift
                if ($request->filled('shift'))
                    $query->where('shift', $request->shift);

                // filter by status
                if ($request->filled('status'))
                    $query->where('status', $request->status);

                // search by batch, semester and department
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        // search in batches table
                        $q->where('batch_name', 'like', "%{$search}%")
                            // search in semesters table
                            ->orWhereHas('semester', function ($subQuery) use ($search) {
                                $subQuery->where('semester_name', 'like', "%{$search}%");
                            })

                            // search in departments table
                            ->orWhereHas('department', function ($subQuery) use ($search) {
                                $subQuery->where('code', 'like', "%{$search}%");
                            });
                    });
                }

                return $query->orderBy('year_level', 'desc')
                    ->orderBy('shift', 'asc')->paginate(10);

            }, self::BATCHES_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Batches fetched successfully',
                'data' => $batches->map(function ($batch) {
                    return [
                        'id' => $batch->id,
                        'batch_name' => $batch->batch_name,
                        'code' => $batch->code,
                        'year_level' => $batch->year_level,
                        'shift' => $batch->shift,
                        'status' => $batch->status,
                        'department' => $batch->department ? [
                            'id' => $batch->department->id,
                            'code' => $batch->department->code,
                        ] : null,
                        'semester' => $batch->semester ? [
                            'id' => $batch->semester->id,
                            'semester_name' => $batch->semester->semester_name,
                        ] : null,
                    ];
                }),
                'pagination' => [
                    'current_page' => $batches->currentPage(),
                    'last_page' => $batches->lastPage(),
                    'per_page' => $batches->perPage(),
                    'total' => $batches->total(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch batches', $e->getMessage());
        }
    }

    /**
     *  create new batch
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'department_id' => 'nullable|exists:departments,id',
            'semester_id' => 'required|exists:semesters,id',
            'batch_name' => 'required|string|max:100',
            'code' => 'nullable|string|max:50|unique:batches,code',
            'year_level' => 'required|integer|min:1|max:8',
            'shift' => 'required|in:Morning,Day,Evening',
            'status' => 'nullable|in:active,inactive,completed',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'error' => $validator->errors(),
            ], 422);
        }

        $institutionId = auth()->user()->institution_id;

        // verify if department belongs to institution
        if ($request->department_id) {
            $department = Department::where('id', $request->department_id)
                ->where('institution_id', $institutionId)
                ->first();
            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid department selection',
                ], 422);
            }
        }

        // verify if semester belongs to institution
        $semester = Semester::whereHas('academicYear', function ($q) use ($institutionId) {
            $q->where('institution_id', $institutionId);
        })->find($request->semester_id);
        if (!$semester) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid semester selection',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $batch = Batch::create([
                'institution_id' => $institutionId,
                'department_id' => $request->department_id,
                'semester_id' => $request->semester_id,
                'batch_name' => $request->batch_name,
                'code' => $request->code,
                'year_level' => $request->year_level,
                'shift' => $request->shift,
                'status' => $request->status ?? 'active',
            ]);

            // clear cache
            CacheService::forgetPattern("institution:{$institutionId}:batches*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Batch created successfully',
                'data' => [
                    'id' => $batch->id,
                    'batch_name' => $batch->batch_name,
                    'code' => $batch->code,
                    'year_level' => $batch->year_level,
                    'shift' => $batch->shift,
                    'status' => $batch->status,
                    'department' => $batch->department ? [
                        'id' => $batch->department->id,
                        'code' => $batch->department->code,
                    ] : null,
                    'semester' => $batch->semester ? [
                        'id' => $batch->semester->id,
                        'semester_name' => $batch->semester->semester_name,
                    ] : null,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to create batch', $e->getMessage());
        }
    }

    // update batch
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'batch_name' => 'sometimes|string|max:100',
            'code' => 'sometimes|string|max:50|unique:batches,code,' . $id,
            'year_level' => 'sometimes|integer|min:1|max:8',
            'shift' => 'sometimes|in:Morning,Day,Evening',
            'status' => 'sometimes|in:active,inactive,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $institutionId = auth()->user()->institution_id;
        $batch = Batch::where('institution_id', $institutionId)->findOrFail($id);

        DB::beginTransaction();
        try {
            $batch->update($request->only([
                'batch_name',
                'code',
                'year_level',
                'shift',
                'status',
            ]));

            // cache clear
            CacheService::forgetPattern("institution:{$institutionId}:batches*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Batch updated successfully',
                'data' => [
                    'id' => $batch->id,
                    'batch_name' => $batch->batch_name,
                    'code' => $batch->code,
                    'year_level' => $batch->year_level,
                    'shift' => $batch->shift,
                    'status' => $batch->status,
                    'department' => $batch->department ? [
                        'id' => $batch->department->id,
                        'code' => $batch->department->code,
                    ] : null,
                    'semester' => $batch->semester ? [
                        'id' => $batch->semester->id,
                        'semester_name' => $batch->semester->semester_name,
                    ] : null,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to update batch', $e->getMessage());
        }
    }

    // delete semester
    public function destroy($id)
    {
        $institutionId = auth()->user()->institution_id;
        $batch = Batch::where('institution_id', $institutionId)->findOrFail($id);

        //check if batch has course assignments
        $courseAssignmentsCount = $batch->courseAssignments()->count();
        if ($courseAssignmentsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete batch with course assignments. Please remove course assignments first.'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $batch->forceDelete();

            // cache clear
            CacheService::forgetPattern("institution:{$institutionId}:batches*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Batch deleted permanently',
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to delete batch', $e->getMessage());
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
