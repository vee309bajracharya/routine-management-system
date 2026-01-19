<?php

namespace App\Services;
use App\Models\Routine;
use App\Models\RoutineEntry;
use App\Models\RoutineNotification;
use App\Models\Teacher;
use App\Notifications\RoutinePublishedNotificiation;
use Illuminate\Support\Facades\DB;

class RoutinePublishService
{
    public function publish(int $routineId)
    {
        return DB::transaction(function () use ($routineId) {
            $routine = Routine::findOrFail($routineId);

            // update routine status to published
            $routine->update([
                'status' => 'published',
                'published_at' => now(),
            ]);

            /**
             * identify all teachers associated with the routine
             *  through joining course_assignments to get the teacher_id
             */
            $teacherIds = RoutineEntry::where('routine_id', $routineId)
                ->join('course_assignments', 'routine_entries.course_assignment_id', '=', 'course_assignments.id')
                ->pluck('course_assignments.teacher_id')
                ->unique();

            $teachers = Teacher::with('user')->whereIn('id', $teacherIds)->get();

            foreach ($teachers as $teacher) {
                // log the notification in tracking table
                $notificationLog = RoutineNotification::create([
                    'routine_id' => $routineId,
                    'teacher_id' => $teacher->id,
                    'notification_type' => 'email_and_app',
                    'status' => 'pending',
                    'sent_at' => null,
                ]);

                try {
                    // send the notification to the teacher's account
                    $teacher->user->notify(new RoutinePublishedNotificiation($routine));
                    $notificationLog->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    $notificationLog->update([
                        'status' => 'failed',
                        'error_message' => substr($e->getMessage(), 0, 255)
                    ]);
                }
            }
            return $routine;
        });
    }
}

?>