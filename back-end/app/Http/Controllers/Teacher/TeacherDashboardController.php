<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RoutineEntry;
use App\Services\CacheService;

class TeacherDashboardController extends Controller
{
    private const DASHBOARD_CACHE_TTL = 300;

    public function index(Request $request)
    {
        try {
            $teacherId = auth()->user()->teacher->id;

            // cache key for all list and search/filter parameters
            $cacheKey = "teacher:{$teacherId}:dashboard:" . md5(json_encode($request->all()));

            $dashboardData = CacheService::remember($cacheKey, function () use ($teacherId, $request) {
                return [
                    'today_classes' => $this->fetchTodayClasses($teacherId),
                    'full_schedule' => $this->fetchFullSchedule($teacherId, $request)
                ];
            }, self::DASHBOARD_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Teacher dashboard data fetched successfully',
                'data' => $dashboardData['today_classes'],
                'schedule' => $dashboardData['full_schedule']['list'],
                'pagination' => $dashboardData['full_schedule']['meta']
            ], 200);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to load dashboard data', $e->getMessage());
        }
    }

    /**
     * Internal logic for Today's Classes 'cards'
     */
    private function fetchTodayClasses($teacherId)
    {
        $today = now()->format('l');
        $now = now()->format('H:i');

        return RoutineEntry::where('day_of_week', $today)
            ->whereHas('courseAssignment', fn($q) => $q->where('teacher_id', $teacherId))
            ->with([
                'timeSlot:id,start_time,end_time',
                'room:id,name,room_number,room_type',
                'courseAssignment.course:id,course_name',
                'courseAssignment.batch:id,batch_name,shift',
            ])
            ->get()
            ->map(function ($entry) use ($now) {
                $start = $entry->timeSlot->start_time->format('H:i');
                $end = $entry->timeSlot->end_time->format('H:i');

                $status = match (true) {
                    $now >= $start && $now <= $end => 'Ongoing',
                    $now < $start => 'Upcoming',
                    default => 'Completed'
                };

                return [
                    'id' => $entry->id,
                    'status' => $status,
                    'course' => [
                        'id' => $entry->courseAssignment->course->id,
                        'name' => $entry->courseAssignment->course->course_name,
                    ],

                    'batch' => [
                        'id' => $entry->courseAssignment->batch->id,
                        'name' => $entry->courseAssignment->batch->batch_name,
                        'shift' => $entry->courseAssignment->batch->shift,
                    ],
                    'room' => [
                        'id' => $entry->room->id,
                        'name' => $entry->room->name,
                        'number' => $entry->room->room_number,
                        'type' => $entry->room->room_type,
                    ],
                    'time' => "{$start} - {$end}",
                ];
            })
            ->whereIn('status', ['Ongoing', 'Upcoming']) // only show relevant cards
            ->sortBy('time')
            ->values()
            ->take(2);
    }

    /**
     * Internal logic for Teaching Schedule 'table'
     */
    private function fetchFullSchedule($teacherId, $request)
    {
        $query = RoutineEntry::query()
            ->whereHas('courseAssignment', fn($q) => $q->where('teacher_id', $teacherId))
            ->with([
                'timeSlot:id,start_time,end_time',
                'room:id,room_number,room_type',
                'courseAssignment.course:id,course_name',
                'courseAssignment.batch:id,batch_name,shift',
            ]);

        // search by course or batch name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('courseAssignment.course', fn($courseQuery) => $courseQuery->where('course_name', 'like', "%{$search}%"))
                    ->orWhereHas('courseAssignment.batch', fn($batchQuery) => $batchQuery->where('batch_name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('day')) {
            $query->where('day_of_week', $request->day);
        }

        $query->orderByRaw("FIELD(day_of_week, 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday')");

        $routines = $query->paginate($request->get('per_page', 10));

        return [
            'list' => $routines->getCollection()->transform(fn($entry) => [
                'id' => $entry->id,
                'day' => $entry->day_of_week,
                'shift' => $entry->courseAssignment->batch->shift,
                'batch' => $entry->courseAssignment->batch->batch_name,
                'course' => $entry->courseAssignment->course->course_name,
                'time' => $entry->timeSlot->start_time->format('H:i') . ' - ' . $entry->timeSlot->end_time->format('H:i'),
                'room' => $entry->room->room_number ?? 'N/A',
                'room_type' => $entry->room->room_type ?? 'Lecture'
            ]),
            'meta' => [
                'current_page' => $routines->currentPage(),
                'total' => $routines->total(),
            ]
        ];
    }

    // private helper method
    private function errorResponse($message, $error = null, $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $error,
        ], $status);
    }
}
