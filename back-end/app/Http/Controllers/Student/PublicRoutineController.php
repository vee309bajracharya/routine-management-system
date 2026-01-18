<?php

namespace App\Http\Controllers\Student;

use App\Models\Routine;
use App\Models\TimeSlot;
use App\Models\RoutineEntry;
use Illuminate\Http\Request;
use App\Traits\Hashidable;
use Illuminate\Support\Facades\URL;
use App\Http\Controllers\Controller;
use App\Http\Resources\Routines\RoutineEntryResource;
use App\Http\Resources\Routines\RoutineDetailResource;

class PublicRoutineController extends Controller
{
    use Hashidable;

    // Signed URL and Hashids
    public function generateSecureLink(Request $request)
    {
        // front-end sends Hashids
        $url = URL::temporarySignedRoute(
            'public.routine.view',
            now()->addHours(24),
            [
                'semester_id' => $request->semester_id,
                'batch_id' => $request->batch_id
            ]
        );

        // path and query part
        $parsedUrl = parse_url($url);
        $securePath = $parsedUrl['path'] . '?' . $parsedUrl['query'];

        return response()->json([
            'success' => true,
            'url' => $securePath
        ], 200);
    }

    // students can only view published routine
    public function getPublishedRoutine(Request $request)
    {
        try {
            $semesterId = $this->decodeId($request->query('semester_id'));
            $batchId = $this->decodeId($request->query('batch_id'));

            if (!$semesterId || !$batchId)
                return $this->errorResponse('Invalid parameters', null, 400);

            // 'published' status
            $routine = Routine::where('batch_id', $batchId)
                ->where('semester_id', $semesterId)
                ->where('status', 'published')
                ->first();

            if (!$routine)
                return $this->errorResponse('No published routine found for this selection', null, 404);

            // timeslot for grid headers
            $timeSlots = TimeSlot::where('batch_id', $batchId)
                ->where('semester_id', $semesterId)
                ->where('shift', $routine->batch->shift)
                ->where('is_active', true)
                ->orderBy('start_time', 'asc')
                ->get();

            // fetch routine_entries
            $entries = RoutineEntry::where('routine_id', $routine->id)->get();
            return response()->json([
                'success' => true,
                'data' => [
                    'routine' => new RoutineDetailResource($routine),
                    'timeSlots' => $timeSlots,
                    'entries' => RoutineEntryResource::collection($entries)
                ]
            ], 200);
        } catch (\Exception $e) {
            return $this->errorResponse('Error fetching routine', $e->getMessage());
        }
    }

    // helper
    private function errorResponse($message, $error, $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $error,
        ], $status);
    }
}
