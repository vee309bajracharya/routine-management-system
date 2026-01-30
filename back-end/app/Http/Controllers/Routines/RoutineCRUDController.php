<?php

namespace App\Http\Controllers\Routines;

use App\Models\Routine;
use App\Models\RoutineEntry;
use App\Services\RoutinePublishService;
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
                    'batch:id,batch_name,shift',
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
            }, 300);

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

            $routine->load([
                'institution:id,institution_name',
                'semester:id,semester_name',
                'batch:id,batch_name,shift',
                'generatedBy:id,name'
            ]);

            (new RoutineHelperController())->clearRoutineCaches($routine); //clear cache as new routine affects listing

            DB::commit();

            return (new RoutineDetailResource($routine))->additional([
                'success' => true,
                'message' => 'Routine created successfully',
            ])->response()->setStatusCode(201);

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
                        'batch:id,batch_name,shift',
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

    // restore soft deleted routine
    public function restore($id)
    {
        try {
            DB::beginTransaction();

            // find soft-deleted routine
            $routine = Routine::withTrashed()
                ->where('id', $id)
                ->firstOrFail();

            // check if routine is soft-deleted
            if (!$routine->trashed()) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Routine is not deleted'
                ], 422);
            }

            // before routine restore check
            /**
             * conflict with 'Published' routines only
             * for date overlap
             */
            $conflictExists = Routine::where('semester_id', $routine->semester_id)
                ->where('batch_id', $routine->batch_id)
                ->where('id', '!=', $id)
                ->where('status', 'published')
                ->where(function ($query) use ($routine) {
                    $query->where(function ($q) use ($routine) {
                        // Case 1: New routine starts during existing routine
                        $q->where('effective_from', '<=', $routine->effective_from)
                            ->where('effective_to', '>=', $routine->effective_from);
                    })->orWhere(function ($q) use ($routine) {
                        // Case 2: New routine ends during existing routine
                        $q->where('effective_from', '<=', $routine->effective_to)
                            ->where('effective_to', '>=', $routine->effective_to);
                    })->orWhere(function ($q) use ($routine) {
                        // Case 3: New routine completely contains existing routine
                        $q->where('effective_from', '>=', $routine->effective_from)
                            ->where('effective_to', '<=', $routine->effective_to);
                    });
                })
                ->exists();
            if ($conflictExists) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot restore routine. Please adjust the dates or delete the conflicting routine first.'
                ], 422);
            }

            $routine->restore(); //restore the routine
            //initially set the restored routine to 'draft'
            $routine->refresh();
            $routine->status = 'draft';
            $routine->save();

            // also restore the routine_entries related with this routine
            RoutineEntry::withTrashed()
                ->where('routine_id', $id)
                ->restore();

            (new RoutineHelperController())->clearRoutineCaches($routine); // Clear cache as routine affects listing

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Routine restored successfully',
                'data' => new RoutineDetailResource($routine),
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Routine not found',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore routine',
                'error' => $e->getMessage()
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

    // publish a routine and notify all assigned teachers
    public function publish(int $id, RoutinePublishService $publishService)
    {
        try {
            $routine = Routine::withCount('routineEntries')->findOrFail($id);

            // if routine_entries are empty
            if ($routine->routine_entries_count === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot publish an empty routine. Please add some class entries first.'
                ], 422);
            }

            // if routine is already published, don't publish it
            if ($routine->status === 'published') {
                return response()->json([
                    'success' => false,
                    'message' => 'This routine is already published'
                ], 422);
            }

            $publishedRoutine = $publishService->publish($id); //execution via Service

            return response()->json([
                'success' => true,
                'message' => 'Routine published successfully and teachers are being notified via email and app',
                'data' => new RoutineDetailResource($publishedRoutine)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to publish routine. Please check if mail settings are correct',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}
