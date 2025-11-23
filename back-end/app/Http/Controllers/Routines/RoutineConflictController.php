<?php

namespace App\Http\Controllers\Routines;

use App\Http\Controllers\Controller;
use App\Models\CourseAssignment;
use App\Models\RoutineEntry;
use App\Models\TeacherAvailability;
use App\Models\TimeSlot;
use Illuminate\Http\Request;

class RoutineConflictController extends Controller
{
    /**
     * controller to prevent conflict cases for :
     *  - room conflict
     *  - teacher conflict across all routines
     *  - teacher availability
     *  - conflict across departments - as teacher teaches in multiple departments
     */

    //Small local cache to prevent repeated loading of same TimeSlot
    private function getSlot($id)
    {
        static $cache = [];

        if (!isset($cache[$id])) {
            $cache[$id] = TimeSlot::find($id);
        }

        return $cache[$id];
    }


    /**
     * checkAllConflicts: 
     * @param mixed $routineId
     * @param mixed $courseAssignmentId
     * @param mixed $roomId
     * @param mixed $timeSlotId
     * @param mixed $day
     * @param mixed $excludeEntryId - exclude an existing entry
     * @return bool|\Illuminate\Http\JsonResponse
     */
    public function checkAllConflicts($routineId, $courseAssignmentId, $roomId, $timeSlotId, $day, $excludeEntryId = null)
    {
        // room conflict across all routines (check time overlap on same day)
        if ($this->roomConflict($roomId, $timeSlotId, $day, $excludeEntryId)) {
            return response()->json([
                'success' => false,
                'message' => 'Room is already booked for this timeslot'
            ], 422);
        }

        // teacher conflict across all routines (check time overlap on same day)
        if ($this->teacherConflict($courseAssignmentId, $timeSlotId, $day, $excludeEntryId)) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher is already assigned at this time'
            ], 422);
        }

        // teacher availability - to check if teacher is free during the full timeslot
        if (!$this->teacherAvailability($courseAssignmentId, $timeSlotId, $day)) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher is not available at this time'
            ], 422);
        }
        return true;
    }


    /**
     * roomConflict - any active (not cancelled) RoutineEntry with the same room on the same day 
     * whose time slot overlaps with the candidate timeslot->conflict
     * @param mixed $roomId
     * @param mixed $candidateTimeSlotId
     * @param mixed $day
     * @param mixed $excludeEntryId
     */
    private function roomConflict($roomId, $candidateTimeSlotId, $day, $excludeEntryId = null)
    {
        $candidate = $this->getSlot($candidateTimeSlotId);
        if (!$candidate)
            return false;

        $candidateStart = $candidate->start_time;
        $candidateEnd = $candidate->end_time;

        $query = RoutineEntry::where('room_id', $roomId)
            ->where('day_of_week', $day)
            ->where('is_cancelled', false)
            ->whereHas('timeSlot', function ($q) use ($candidateStart, $candidateEnd) {
                // time overlap condition as : existing.start <= candidate.end AND existing.end >= candidate.start
                $q->whereTime('start_time', '<=', $candidateEnd)
                    ->whereTime('end_time', '>=', $candidateStart);
            });
        if ($excludeEntryId) {
            $query->where('id', '!=', $excludeEntryId);
        }
        return $query->exists();
    }

    /**
     * teacherConflict - any active RoutineEntry where the teacher is assigned
     * and the corresponding time slot overlaps with candidate time slot
     * @param mixed $courseAssignmentId
     * @param mixed $candidateTimeSlotId
     * @param mixed $day
     * @param mixed $excludeEntryId
     */
    private function teacherConflict($courseAssignmentId, $candidateTimeSlotId, $day, $excludeEntryId = null)
    {
        $assignment = CourseAssignment::find($courseAssignmentId);
        if (!$assignment)
            return false;

        $teacherId = $assignment->teacher_id;
        $candidate = $this->getSlot($candidateTimeSlotId);
        if (!$candidate)
            return false;

        $candidateStart = $candidate->start_time;
        $candidateEnd = $candidate->end_time;

        $query = RoutineEntry::where('day_of_week', $day)
            ->where('is_cancelled', false)
            ->whereHas('courseAssignment', function ($q) use ($teacherId) {
                $q->where('teacher_id', $teacherId);
            })
            ->whereHas('timeSlot', function ($q) use ($candidateStart, $candidateEnd) {
                // overlap
                $q->whereTime('start_time', '<=', $candidateEnd)
                    ->whereTime('end_time', '>=', $candidateStart);
            });

        if ($excludeEntryId) {
            $query->where('id', '!=', $excludeEntryId);
        }
        return $query->exists();
    }

    /**
     * teacherAvailability
     * @param mixed $courseAssignmentId
     * @param mixed $candidateTimeSlotId
     * @param mixed $day
     * @return bool
     */
    private function teacherAvailability($courseAssignmentId, $candidateTimeSlotId, $day)
    {
        $assignment = CourseAssignment::find($courseAssignmentId);
        if (!$assignment)
            return false;

        $teacherId = $assignment->teacher_id;
        $slot = $this->getSlot($candidateTimeSlotId);
        if (!$slot)
            return false;

        $availability = TeacherAvailability::where('teacher_id', $teacherId)
            ->where('day_of_week', $day)
            ->where('is_available', true)
            ->first();

        if (!$availability)
            return false;

        // to ensure candidate slot entirely lies within teacher available
        return $slot->start_time->format('H:i') >= $availability->available_from->format('H:i')
            && $slot->end_time->format('H:i') <= $availability->available_to->format('H:i');
    }


    /**
     * checkEntryConflict
     * @param Request $request
     * @return bool|\Illuminate\Http\JsonResponse
     */
    public function checkEntryConflict(Request $request)
    {
        $data = $request->only([
            'routine_id',
            'course_assignment_id',
            'room_id',
            'time_slot_id',
            'day_of_week',
            'exclude_entry_id'
        ]);

        // validate req fields before calling this method
        $result = $this->checkAllConflicts(
            $data['routine_id'],
            $data['course_assignment_id'],
            $data['room_id'],
            $data['time_slot_id'],
            $data['day_of_week'],
            $data['exclude_entry_id'] ?? null,
        );
        if ($result === true) {
            return response()->json([
                'success' => true,
                'message' => 'No conflicts detected'
            ], 200);
        }
        return $result;
    }

}
