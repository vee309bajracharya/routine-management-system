<?php

namespace App\Http\Resources\Routines;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoutineEntryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * 
     * to include full nested relations for RoutineEntryEditModal:
     *  - courseAssignment.semester.academic_year_id
     *  - courseAssignment.batch.department
     *  - room with display_label
     *  - timeSlot with display_label
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'routine_id' => $this->routine_id,
            'day_of_week' => $this->day_of_week,
            'entry_type' => $this->entry_type,
            'notes' => $this->notes,
            'is_cancelled' => $this->is_cancelled,

            // update ids
            'course_assignment_id' => $this->course_assignment_id,
            'room_id' => $this->room_id,
            'time_slot_id' => $this->time_slot_id,

            // full course assignment with nested relations
            'course_assignment' => $this->courseAssignment ? [
                'id' => $this->courseAssignment->id,
                'semester_id' => $this->courseAssignment->semester_id,
                'batch_id' => $this->courseAssignment->batch_id,

                // course info
                'course' => $this->courseAssignment ? [
                    'id' => $this->courseAssignment->course->id ?? null,
                    'name' => $this->courseAssignment->course->course_name ?? null,
                    'code' => $this->courseAssignment->course->code ?? null,
                ] : null,

                // teacher info
                'teacher' => $this->courseAssignment ? [
                    'id' => $this->courseAssignment->teacher->id ?? null,
                    'teacher_details' => $this->courseAssignment->teacher->user ?? null,
                ] : null,

                // semester with academic_year_id
                'semester' => $this->courseAssignment->semester ? [
                    'id' => $this->courseAssignment->semester->id,
                    'academic_year_id' => $this->courseAssignment->semester->academic_year_id ?? null,
                    'display_label' => $this->courseAssignment->semester->semester_name ?? 'N/A',
                ] : null,

                // batch with department
                'batch' => $this->courseAssignment->batch ? [
                    'id' => $this->courseAssignment->batch->id,
                    'shift' => $this->courseAssignment->batch->shift,
                    'department_id' => $this->courseAssignment->batch->department_id,
                    'display_label' => $this->courseAssignment->batch->batch_name ?? 'N/A',

                    'department' => $this->courseAssignment->batch->department ? [
                        'id' => $this->courseAssignment->batch->department->id,
                        'name' => $this->courseAssignment->batch->department->department_name ?? 'N/A',
                        'display_label' => $this->courseAssignment->batch->department->code ?? 'N/A',
                    ] : null,
                ] : null,
                
            ] : null,

            // room info
            'room' => $this->room ? [
                'id' => $this->room->id,
                'name' => $this->room->name,
                'room_type' => $this->room->room_type ?? null,
                'display_label' => "{$this->room->name} ({$this->room->room_type})",
            ] : null,

            // time_slot info
            'time_slot' => $this->timeSlot ? [
                'id' => $this->timeSlot->id,
                'name' => $this->timeSlot->name,
                'start_time' => $this->timeSlot->start_time->format('H:i'),
                'end_time' => $this->timeSlot->end_time->format('H:i'),
                'display_label' => $this->timeSlot->start_time->format('H:i') . ' - ' . $this->timeSlot->end_time->format('H:i'),
            ] : null,
        ];
    }
}
