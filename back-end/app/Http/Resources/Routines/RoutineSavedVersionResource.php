<?php

namespace App\Http\Resources\Routines;

use App\Models\CourseAssignment;
use App\Models\Room;
use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoutineSavedVersionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $snapshot = is_string($this->routine_snapshot)
            ? json_decode($this->routine_snapshot, true)
            : $this->routine_snapshot;

        $entries = collect($snapshot);

        //pre-fetch all data to avoid N+1 queries
        $assignmentIds = $entries->pluck('course_assignment_id')->filter()->unique();
        $roomIds = $entries->pluck('room_id')->filter()->unique();
        $slotIds = $entries->pluck('time_slot_id')->filter()->unique();

        $assignments = CourseAssignment::with(['course', 'teacher.user', 'semester', 'batch.department'])
            ->whereIn('id', $assignmentIds)->get()->keyBy('id');

        $rooms = Room::whereIn('id', $roomIds)->get()->keyBy('id');
        $timeSlots = TimeSlot::whereIn('id', $slotIds)->get()->keyBy('id');

        return [
            'id' => $this->id,
            'routine_id' => $this->routine_id,
            'label' => $this->label,
            'description' => $this->description,
            'saved_date' => $this->saved_date,
            'entries' => $entries->map(function ($entry) use ($assignments, $rooms, $timeSlots) {
                $assignment = $assignments->get($entry['course_assignment_id']);
                $room = $rooms->get($entry['room_id']);
                $slot = $timeSlots->get($entry['time_slot_id']);

                return [
                    'day_of_week' => $entry['day_of_week'],
                    'time_slot_id' => $entry['time_slot_id'],
                    'entry_type' => $entry['entry_type'] ?? 'Lecture',
                    'notes' => $entry['notes'] ?? null,
                    'is_cancelled' => $entry['is_cancelled'] ?? false,
                    'course_assignment' => $assignment ? [
                        'course' => [
                            'name' => $assignment->course?->course_name,
                            'code' => $assignment->course?->code,
                        ],
                        'teacher' => [
                            'name' => $assignment->teacher?->user?->name,
                        ],
                        'semester' => $assignment->semester?->semester_name,
                        'batch' => $assignment->batch?->batch_name,
                    ] : null,
                    'room' => $room ? [
                        'display_label' => "{$room->name} ({$room->room_type})",
                    ] : null,
                    'time_slot' => $slot ? [
                        'display_label' => $slot->display_label ?? ($slot->start_time->format('H:i') . ' - ' . $slot->end_time->format('H:i')),
                    ] : null,
                ];
            })->values(),
        ];
    }
}
