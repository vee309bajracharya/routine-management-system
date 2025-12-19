<?php

namespace App\Http\Controllers\Routines;

use App\Models\Routine;
use Illuminate\Http\Request;
use App\Services\CacheService;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Routines\RoutineHelperController;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\Routines\RoutineListResource;
use App\Http\Resources\Routines\RoutineDetailResource;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RoutineCRUDController extends Controller
{
    //TTL Cache constants
    private const ROUTINE_CACHE_TTL = 3600; // 1hr

    // Routine CRUD starts

    /**
     * index() - Display listing of routines with filters and pagination
     */

    public function index(Request $request)
    {
        try {
            $cacheKey = 'routines:list:' . md5(json_encode($request->all()));

            $routines = CacheService::remember($cacheKey, function () use ($request) {
                $query = Routine::with([
                    'institution:id,institution_name',
                    'semester:id,semester_name',
                    'batch:id,batch_name',
                    'generatedBy:id,name'
                ])
                    ->orderBy('created_at', 'desc');

                // apply filters
                if ($request->has('status'))
                    $query->where('status', $request->status);
                if ($request->has('institution_id'))
                    $query->where('institution_id', $request->institution_id);
                if ($request->has('semester_id'))
                    $query->where('semester_id', $request->semester_id);
                if ($request->has('batch_id'))
                    $query->where('batch_id', $request->batch_id);
                // Search by title
                if ($request->has('search')) {
                    $query->where('title', 'like', '%' . $request->search . '%');
                }

                // date range filter
                if ($request->has('date_from'))
                    $query->whereDate('effective_from', '>=', $request->date_from);
                if ($request->has('date_to'))
                    $query->whereDate('effective_to', '<=', $request->date_to);

                return $query->paginate(15);
            }, 1800);

            return RoutineListResource::collection($routines)->additional([
                'success' => true
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch routines',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create new routine
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'semester_id' => 'required|exists:semesters,id',
            'batch_id' => 'nullable|exists:batches,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'effective_from' => 'required|date',
            'effective_to' => 'required|date|after:effective_from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            $routine = Routine::create([
                'institution_id' => auth()->user()->institution_id,
                'semester_id' => $request->semester_id,
                'batch_id' => $request->batch_id,
                'title' => $request->title,
                'description' => $request->description,
                'generated_by' => auth()->id(),
                'status' => 'draft',
                'published_at' => null,
                'effective_from' => $request->effective_from,
                'effective_to' => $request->effective_to,
            ]);

            (new RoutineHelperController())->clearRoutineCaches($routine); //clear cache as new routine affects listing

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Routine created successfully',
                'data' => [
                    'id' => $routine->id,
                    'title' => $routine->title,
                    'description' => $routine->description,
                    'status' => $routine->status,
                    'effective_from' => $routine->effective_from,
                    'effective_to' => $routine->effective_to,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create routine: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * show specific routine with all details
     */
    public function show($id)
    {
        try {
            // cache key for specific routine
            $cacheKey = CacheService::routineKey($id);
            $routineData = CacheService::remember(
                $cacheKey,
                function () use ($id) {
                    $routine = Routine::with([
                        'institution:id,institution_name',
                        'semester:id,semester_name',
                        'batch:id,batch_name',
                        'generatedBy:id,name'
                    ])->findOrFail($id);

                    return (new RoutineDetailResource($routine))->toArray(request());
                },
                self::ROUTINE_CACHE_TTL
            );

            return response()->json([
                'success' => true,
                'data' => $routineData,
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Routine not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch routine'
            ], 500);
        }
    }

    /**
     * update routine materials
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'effective_from' => 'sometimes|date',
            'effective_to' => 'sometimes|date|after:effective_from',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'error' => $validator->errors()
            ], 422);
        }
        try {
            $routine = Routine::findOrFail($id); //find routine or fail
            $routine->update($request->only([
                'title',
                'description',
                'effective_from',
                'effective_to',
                'status'
            ])); //only provided fields update

            // after update, clear cache
            (new RoutineHelperController())->clearRoutineCaches($routine); //clear cache as new routine affects listing

            return response()->json([
                'success' => true,
                'message' => 'Routine updated successfully',
                'data' => $routine->fresh() // reload from db
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Routine not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update routine',
            ], 500);
        }
    }

    // soft delete the routine
    public function destroy($id)
    {
        try {
            $routine = Routine::findOrFail($id);
            if ($routine->status === 'published') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete published routine. Archive it first',
                ], 422);
            }
            $routine->delete(); //sets deleted_at timestamp instead of removing the record
            (new RoutineHelperController())->clearRoutineCaches($routine); //clear cache as new routine affects listing
            return response()->json([
                'success' => true,
                'message' => 'Routine deleted successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Routine not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete routine',
            ], 500);
        }
    }

    // archive the routine
    public function archive($id)
    {
        try {
            $routine = Routine::findOrFail($id);

            if ($routine->status !== 'published') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only published routines can be archived',
                ], 422);
            }

            $routine->status = 'archieved';
            $routine->save();

            (new RoutineHelperController())->clearRoutineCaches($routine);

            return response()->json([
                'success' => true,
                'message' => 'Routine archived successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Routine not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive routine',
            ], 500);
        }
    }

}
