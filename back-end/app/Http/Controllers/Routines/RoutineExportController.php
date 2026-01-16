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

        // shift from batch model
        $shift = $request->query('shift', $routine->batch->shift ?? 'Morning');

        // fetch all TimeSlots for this specific batch/semester/shift  - ensures Break column
        $timeSlots = TimeSlot::where('batch_id', $routine->batch_id)
            ->where('semester_id', $routine->semester_id)
            ->where('shift', $shift)
            ->where('is_active', true)
            ->select('start_time', 'end_time', 'slot_type')
            ->distinct()
            ->orderBy('start_time', 'asc')
            ->get();

        // fetch actual entries
        $entries = RoutineEntry::with([
            'courseAssignment.course',
            'courseAssignment.teacher.user',
            'room',
            'timeSlot'
        ])
            ->where('routine_id', $routineId)
            ->whereHas('timeSlot', function ($query) use ($shift) {
                $query->where('shift', $shift);
            })
            ->whereNull('deleted_at')
            ->get();

        // Grid mapping using time String as key
        $grid = [];
        foreach ($entries as $entry) {
            $timeKey = $entry->timeSlot->start_time->format('H:i');
            $grid[$entry->day_of_week][$timeKey] = [
                'course_name' => $entry->courseAssignment?->course?->course_name,
                'teacher_name' => $entry->courseAssignment?->teacher?->user?->name,
                'room_label' => $entry->room?->display_label ?? $entry->room?->name,
                'entry_type' => $entry->entry_type,
            ];
        }

        $status = $request->query('status', $routine->status ?? 'draft');

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