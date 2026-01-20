<?php

namespace App\Http\Controllers\Teacher;

use App\Models\Routine;
use App\Models\RoutineEntry;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TeacherRoutineController extends Controller
{
    public function getMySchedule(Request $request)
    {
        $teacherId = $request->user()->teacher->id;

        // fetch all routine entries for this teacher across all published routines
        $entries = RoutineEntry::withFullDetails()
            ->whereHas('routine', function ($q) {
                $q->where('status', 'published');
            })
            ->whereHas('courseAssignment', function ($q) use ($teacherId) {
                $q->where('teacher_id', $teacherId);
            })
            ->active()
            ->get();

        $days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        $grid = [];
        foreach ($days as $day) {
            $grid[$day] = [];
        }

        foreach ($entries as $entry) {
            $grid[$entry->day_of_week][] = [
                'id' => $entry->id,
                'course' => $entry->courseAssignment->course->course_name,
                'batch' => $entry->courseAssignment->batch->batch_name,
                'shift' => $entry->courseAssignment->batch->shift,
                'room' => $entry->room->room_number,
                'room_type' => $entry->room->room_type,
                'time' => $entry->timeSlot->start_time->format('H:i') . ' - ' . $entry->timeSlot->end_time->format('H:i'),
                'type' => $entry->entry_type,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $grid
        ], 200);
    }

    public function getRoutineView($id)
    {
        $routine = Routine::where('status', 'published')->findOrFail($id); //only published routine

        $routineData = $routine->getPdfData(); // to view as pdf logic from Routine Model

        return response()->json([
            'success' => true,
            'data' => [
                'routine' => $routine->load(['institution', 'semester', 'batch', 'generatedBy']),
                'entries' => $routine->routineEntries()->withFullDetails()->get(),
                'timeSlots' => $routineData['timeSlots'],
            ]
        ], 200);
    }
}
