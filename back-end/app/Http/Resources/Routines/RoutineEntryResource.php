<?php

namespace App\Http\Resources\Routines;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoutineEntryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
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

            // room info
            'room' => $this->room ? [
                'id' => $this->room->id,
                'name' => $this->room->name,
            ] : null,

            // time_slot info
            'time_slot' => $this->timeSlot ? [
                'id' => $this->timeSlot->id,
                'start_time' => $this->timeSlot->start_time,
                'end_time' => $this->timeSlot->end_time,
            ] : null,
        ];
    }
}
