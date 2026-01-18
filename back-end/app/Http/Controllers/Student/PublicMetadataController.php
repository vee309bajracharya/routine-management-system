<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Traits\Hashidable;

class PublicMetadataController extends Controller
{
    use Hashidable;

    //get all departments for a specific institution
    public function getDepartments($institutionId)
    {
        try {
            $departments = Department::where('institution_id', $institutionId)
                ->select('id', 'department_name', 'code', 'description')
                ->get();

            return $this->successResponse('Departments fetched successfully', $departments);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch departments', $e->getMessage());
        }
    }

    // get all academic years, semesters and batches of a selected department
    public function getDeptAcademicStructure($deptId)
    {
        try {
            $academicYears = AcademicYear::where('department_id', $deptId)
                ->with([
                    'semesters' => function ($semQuery) {
                        $semQuery->select('id', 'academic_year_id', 'semester_name')->where('is_active', true);
                        // nested relation Semester->Batch
                        $semQuery->with([
                            'batches' => function ($batchQuery) {
                            $batchQuery->select('id', 'semester_id', 'batch_name', 'code', 'shift')
                                ->where('status', 'active');
                        }
                        ]);
                    },
                ])
                ->select('id', 'year_name')
                ->where('is_active', true)
                ->get();

            // transform the collection to include Hashids
            $transformedData = $academicYears->map(function ($year) {
                return [
                    'id' => $this->encodeId($year->id),
                    'year_name' => $year->year_name,
                    'semesters' => $year->semesters->map(function ($sem) {
                        return [
                            'id' => $this->encodeId($sem->id),
                            'semester_name' => $sem->semester_name,
                            'batches' => $sem->batches->map(function ($batch) {
                                return [
                                    'id' => $this->encodeId($batch->id),
                                    'batch_name' => $batch->batch_name,
                                    'shift' => $batch->shift,
                                    'code' => $batch->code
                                ];
                            })
                        ];
                    })
                ];
            });

            return $this->successResponse('Academic Details fetched successfully', $transformedData);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch Academic Details', $e->getMessage());
        }
    }

    // helpers
    private function successResponse($message, $data, $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }
    private function errorResponse($message, $error, $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $error,
        ], $status);
    }

}
