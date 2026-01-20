<?php

namespace App\Http\Controllers\Admin;

use App\Models\AcademicYear;
use App\Models\Semester;
use App\Services\CacheService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;


class SemesterController extends Controller
{
    private const SEMESTER_CACHE_TTL = 3600;

    //list all semesters
    public function index(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $academicYearId = $request->query('academic_year_id');

            $cacheKey = "institution:{$institutionId}:semesters:list:" . md5(json_encode($request->query()));

            $semesters = CacheService::remember($cacheKey, function () use ($institutionId, $academicYearId, $request) {
                $query = Semester::whereHas('academicYear', function ($q) use ($institutionId) {
                    $q->where('institution_id', $institutionId);
                })->with('academicYear:id,year_name');

                // filter by academic year
                if ($academicYearId)
                    $query->where('academic_year_id', $academicYearId);

                // filter by status
                if ($request->filled('is_active'))
                    $query->where('is_active', $request->is_active);

                // search by semester name or academic year name
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        //search in semesters table
                        $q->where('semester_name', 'like', "%{$search}%")

                            // search in academic years table
                            ->orWhereHas('academicYear', function ($subQuery) use ($search) {
                                $subQuery->where('year_name', 'like', "%{$search}%");
                            });
                    });
                }
                return $query->orderBy('created_at', 'desc')->paginate(10);
            }, self::SEMESTER_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Semesters fetched successfully',
                'data' => $semesters->map(function ($sem) {
                    return [
                        'id' => $sem->id,
                        'semester_name' => $sem->semester_name,
                        'semester_number' => $sem->semester_number,
                        'start_date' => Carbon::parse($sem->start_date)->format('Y-m-d'),
                        'end_date' => Carbon::parse($sem->end_date)->format('Y-m-d'),
                        'is_active' => $sem->is_active,
                        'academic_year' => $sem->academicYear ? [
                            'id' => $sem->academicYear->id,
                            'year_name' => $sem->academicYear->year_name,
                        ] : null,
                    ];
                }),
                'pagination' => [
                    'current_page' => $semesters->currentPage(),
                    'last_page' => $semesters->lastPage(),
                    'per_page' => $semesters->perPage(),
                    'total' => $semesters->total(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch semester', $e->getMessage());
        }
    }

    // create new semester
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'academic_year_id' => 'required|exists:academic_years,id',
            'semester_name' => 'required|string|max:100',
            'semester_number' => 'required|integer|min:1|max:8',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'nullable|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'error' => $validator->errors(),
            ], 422);
        }


        $institutionId = auth()->user()->institution_id;

        $academicYear = AcademicYear::where('id', $request->academic_year_id)
            ->where('institution_id', $institutionId)
            ->first();

        if (!$academicYear) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid academic year selection',
            ], 422);
        }

        // validation:  semester start and end date must fall within academic year date
        if ($request->start_date < Carbon::parse($academicYear->start_date)->format('Y-m-d') || $request->end_date > Carbon::parse($academicYear->end_date)->format('Y-m-d')) {
            return response()->json([
                'success' => false,
                'message' => 'Semester dates must fall within academic year dates'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $semester = Semester::create([
                'academic_year_id' => $request->academic_year_id,
                'semester_name' => $request->semester_name,
                'semester_number' => $request->semester_number,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'is_active' => $request->is_active ?? true,
            ]);

            // cache clear
            CacheService::forget("academic_year:{$request->academic_year_id}:semesters");
            CacheService::forgetPattern("institution:{$institutionId}:all_semesters");
            CacheService::forgetPattern("institution:{$institutionId}:semesters*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Semester created successfully',
                'data' => [
                    'id' => $semester->id,
                    'semester_name' => $semester->semester_name,
                    'semester_number' => $semester->semester_number,
                    'start_date' => Carbon::parse($semester->start_date)->format('Y-m-d'),
                    'end_date' => Carbon::parse($semester->end_date)->format('Y-m-d'),
                    'is_active' => $semester->is_active,
                    'academic_year' => [
                        'id' => $academicYear->id,
                        'year_name' => $academicYear->year_name,
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to create semester', $e->getMessage());
        }
    }

    // update semester
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'semester_name' => 'sometimes|string|max:100',
            'semester_number' => 'sometimes|integer|min:1|max:8',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'is_active' => 'nullable|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }


        $institutionId = auth()->user()->institution_id;
        $semester = Semester::whereHas('academicYear', function ($q) use ($institutionId) {
            $q->where('institution_id', $institutionId);
        })->findOrFail($id);

        $academicYear = $semester->academicYear;

        // Date Range Validation (fallback)
        $inputStart = $request->start_date ?? $semester->start_date;
        $inputEnd = $request->end_date ?? $semester->end_date;

        $semStart = Carbon::parse($inputStart);
        $semEnd = Carbon::parse($inputEnd);
        $academicYearStart = Carbon::parse($academicYear->start_date);
        $academicYearEnd = Carbon::parse($academicYear->end_date);

        if ($semStart->gte($semEnd)) {
            return response()->json([
                'success' => false,
                'message' => 'End date must be after start date'
            ], 422);
        }

        if ($semStart->lt($academicYearStart) || $semEnd->gt($academicYearEnd)) {
            return response()->json([
                'success' => false,
                'message' => "Semester dates must be between {$academicYearStart->format('Y-m-d')} and {$academicYearEnd->format('Y-m-d')}"
            ], 422);
        }

        DB::beginTransaction();
        try {
            $academicYearId = $semester->academic_year_id;

            // update only fields provided
            $semester->update($request->only([
                'semester_name',
                'semester_number',
                'start_date',
                'end_date',
                'is_active'
            ]));

            // cache clear
            CacheService::forget("academic_year:{$academicYearId}:semesters");
            CacheService::forgetPattern("institution:{$institutionId}:all_semesters");
            CacheService::forgetPattern("institution:{$institutionId}:semesters*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Semester updated successfully',
                'data' => [
                    'id' => $semester->id,
                    'semester_name' => $semester->semester_name,
                    'semester_number' => $semester->semester_number,
                    'start_date' => Carbon::parse($semester->start_date)->format('Y-m-d'),
                    'end_date' => Carbon::parse($semester->end_date)->format('Y-m-d'),
                    'is_active' => $semester->is_active,
                    'academic_year' => [
                        'id' => $academicYear->id,
                        'year_name' => $academicYear->year_name,
                    ],
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to update semester', $e->getMessage());
        }
    }

    // delete semester
    public function destroy($id)
    {
        $institutionId = auth()->user()->institution_id;

        $semester = Semester::whereHas('academicYear', function ($q) use ($institutionId) {
            $q->where('institution_id', $institutionId);
        })->findOrFail($id);

        // check if semester has batches
        $batchesCount = $semester->batches()->count();
        if ($batchesCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete semester with batches. Please remove batches first',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $academicYearId = $semester->academic_year_id;

            $semester->forceDelete();

            // cache clear
            CacheService::forget("academic_year:{$academicYearId}:semesters");
            CacheService::forgetPattern("institution:{$institutionId}:all_semesters");
            CacheService::forgetPattern("institution:{$institutionId}:semesters*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Semester deleted permanently',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to delete semester', $e->getMessage());
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
