<?php

namespace App\Http\Controllers\Routines;

use App\Models\Routine;
use App\Models\TimeSlot;
use Illuminate\Support\Str;
use App\Models\RoutineEntry;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Controllers\Controller;

class RoutineExportController extends Controller
{
    public function exportPdf(Request $request, int $routineId)
    {
        // fetch Routine with basic relations
        $routine = Routine::with(['institution', 'semester', 'batch'])->findOrFail($routineId);

        // fetch all TimeSlots for this specific batch/semester/shift  - ensures Break column
        $timeSlots = TimeSlot::where('batch_id', $routine->batch_id)
            ->where('semester_id', $routine->semester_id)
            ->where('is_active', true)
            ->orderBy('slot_order', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        // fetch actual entries
        $entries = RoutineEntry::with([
            'courseAssignment.course',
            'courseAssignment.teacher.user',
            'room',
        ])
            ->where('routine_id', $routineId)
            ->whereNull('deleted_at')
            ->get();

        // grid [Day][TimeSlotID]
        $grid = [];
        foreach ($entries as $entry) {
            $grid[$entry->day_of_week][$entry->time_slot_id] = [
                'course_name' => $entry->courseAssignment?->course?->course_name,
                'teacher_name' => $entry->courseAssignment?->teacher?->user?->name,
                'room_label' => $entry->room?->display_label ?? $entry->room?->name,
                'entry_type' => $entry->entry_type,
            ];
        }

        $status = $request->query('status', $routine->status ?? 'draft');
        $shift = $request->query('shift', $routine->shift ?? 'Morning');

        // PDF
        $pdf = Pdf::loadView('routines.pdf.routine', [
            'routine' => $routine,
            'grid' => $grid,
            'timeSlots' => $timeSlots,
            'status' => $status,
            'shift' => $shift,
        ])->setPaper('a4', 'landscape');

        // Sanitize title for fileName
        $sanitizedTitle = Str::slug($routine->title, '_');
        $dateStamp = now()->format('Y-m-d');

        $fileName = sprintf(
            '%s_%s.pdf',
            $sanitizedTitle,
            $dateStamp
        );

        return $pdf->download($fileName);
    }
}