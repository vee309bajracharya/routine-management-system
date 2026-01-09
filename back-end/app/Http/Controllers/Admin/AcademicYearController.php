<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AcademicYear;
use App\Models\Department;
use App\Services\CacheService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AcademicYearController extends Controller
{
    private const ACADEMIC_YEAR_CACHE_TTL = 3600;

    /**
     * List all academic years (filters and pagination)
     */
    public function index(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $departmentId = $request->query('department_id');

            $cacheKey = "institution:{$institutionId}:academic_years:list:" . md5(json_encode($request->query()));

            $academicYears = CacheService::remember($cacheKey, function () use ($institutionId, $departmentId, $request) {

                $query = AcademicYear::where('institution_id', $institutionId)
                    ->with(['department:id,department_name,code', 'semesters']);

                if ($departmentId) {
                    $query->where('department_id', $departmentId);
                }

                if ($request->filled('is_active')) {
                    $query->where('is_active', $request->is_active);
                }

                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        //search in academic years
                        $q->where('year_name', 'like', "%{$search}%")

                            // search in departments
                            ->orWhereHas('department', function ($subQuery) use ($search) {
                                $subQuery->where('code', 'like', "%{$search}%");
                            });
                    });
                }

                return $query->orderBy('start_date', 'desc')->paginate(10);
            }, self::ACADEMIC_YEAR_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Academic years fetched successfully',
                'data' => $academicYears->map(function ($year) {
                    return [
                        'id' => $year->id,
                        'year_name' => $year->year_name,
                        'start_date' => Carbon::parse($year->start_date)->format('Y-m-d'),
                        'end_date' => Carbon::parse($year->end_date)->format('Y-m-d'),
                        'semesters' => $year->semesters->map(fn($sem) => [
                            'id' => $sem->id,
                            'semester_name' => $sem->semester_name,
                            'semester_number' => $sem->semester_number,
                        ]),
                        'semesters_count' => $year->semesters->count(),
                        'department' => $year->department ? [
                            'id' => $year->department->id,
                            'name' => $year->department->department_name,
                            'code' => $year->department->code,
                        ] : null,
                        'is_active' => $year->is_active,
                    ];
                }),
                'pagination' => [
                    'current_page' => $academicYears->currentPage(),
                    'last_page' => $academicYears->lastPage(),
                    'per_page' => $academicYears->perPage(),
                    'total' => $academicYears->total(),
                ]
            ], 200);

        } catch (\Exception $e) {
            $this->errorResponse('Failed to fetch academic years', $e->getMessage());
        }
    }

    /**
     * Create academic year
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'department_id' => 'required|exists:departments,id',
            'year_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $institutionId = auth()->user()->institution_id;

        $department = Department::where('institution_id', $institutionId)
            ->findOrFail($request->department_id);

        DB::beginTransaction();

        try {
            $academicYear = AcademicYear::create([
                'institution_id' => $institutionId,
                'department_id' => $department->id,
                'year_name' => $request->year_name,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'is_active' => $request->is_active ?? true,
            ]);

            CacheService::forgetPattern("institution:{$institutionId}:academic_years*");
            CacheService::forgetPattern("institution:{$institutionId}:all_semesters");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Academic year created successfully',
                'data' => [
                    'id' => $academicYear->id,
                    'year_name' => $academicYear->year_name,
                    'start_date' => Carbon::parse($academicYear->start_date)->format('Y-m-d'),
                    'end_date' => Carbon::parse($academicYear->end_date)->format('Y-m-d'),
                    'is_active' => $academicYear->is_active,
                    'department' => [
                        'id' => $department->id,
                        'name' => $department->department_name,
                        'code' => $department->code,
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse('Failed to create academic year', $e->getMessage());
        }
    }

    /**
     * Update academic year (department immutable)
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'year_name' => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $institutionId = auth()->user()->institution_id;
        $academicYear = AcademicYear::where('institution_id', $institutionId)->findOrFail($id);

        // validate date range if both dates are provided or being updated
        $startDate = $request->start_date ?? Carbon::parse($academicYear->start_date)->format('Y-m-d');
        $endDate = $request->end_date ?? Carbon::parse($academicYear->end_date)->format('Y-m-d');

        if ($startDate >= $endDate) {
            return response()->json([
                'success' => false,
                'message' => 'End date must be after start date'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // update fields
            if ($request->has('year_name')) {
                $academicYear->year_name = $request->year_name;
            }
            if ($request->has('start_date')) {
                $academicYear->start_date = $request->start_date;
            }
            if ($request->has('end_date')) {
                $academicYear->end_date = $request->end_date;
            }
            if ($request->has('is_active')) {
                $academicYear->is_active = $request->is_active;
            }

            $academicYear->save();

            CacheService::forget("academic_year:{$id}:details");
            CacheService::forgetPattern("institution:{$institutionId}:academic_years*");
            CacheService::forgetPattern("institution:{$institutionId}:all_semesters");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Academic year updated successfully',
                'data' => [
                    'id' => $academicYear->id,
                    'year_name' => $academicYear->year_name,
                    'start_date' => Carbon::parse($academicYear->start_date)->format('Y-m-d'),
                    'end_date' => Carbon::parse($academicYear->end_date)->format('Y-m-d'),
                    'is_active' => $academicYear->is_active,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse('Failed to update academic year', $e->getMessage());
        }
    }

    /**
     * Permanently delete academic year
     */
    public function destroy($id)
    {

        $institutionId = auth()->user()->institution_id;
        $academicYear = AcademicYear::where('institution_id', $institutionId)->findOrFail($id);

        if ($academicYear->semesters()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete academic year with semesters. Please remove associated semesters first.'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $academicYear->forceDelete();

            CacheService::forget("academic_year:{$id}:details");
            CacheService::forgetPattern("institution:{$institutionId}:academic_years*");
            CacheService::forgetPattern("institution:{$institutionId}:all_semesters");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Academic year deleted permanently',
                'data' => [
                    'id' => $academicYear->id,
                    'year_name' => $academicYear->year_name,
                    'start_date' => Carbon::parse($academicYear->start_date)->format('Y-m-d'),
                    'end_date' => Carbon::parse($academicYear->end_date)->format('Y-m-d'),
                    'is_active' => $academicYear->is_active,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse('Failed to delete academic year', $e->getMessage());
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
