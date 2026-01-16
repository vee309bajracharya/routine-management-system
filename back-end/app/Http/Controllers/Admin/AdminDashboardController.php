<?php

namespace App\Http\Controllers\Admin;

use App\Http\Resources\Routines\RoutineListResource;
use App\Models\Room;
use App\Models\User;
use App\Models\Routine;
use App\Models\Teacher;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Spatie\Activitylog\Models\Activity;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        $institutionId = auth()->user()->institution_id;

        // Section A : Routine Status
        $routineStats = Routine::where('institution_id', $institutionId)
            ->selectRaw("
            count(*) as total,
            count(case when status = 'draft' then 1 end) as draft,
            count(case when status = 'published' then 1 end) as published,
            count(case when status = 'archieved' then 1 end) as archieved
        ")->first();

        // Section B : Faculty Members and Departments
        $facultyStats = [
            'active_faculty' => User::role('teacher')
                ->where('institution_id', $institutionId)->active()->count(),
            'total_faculty' => Teacher::where('institution_id', $institutionId)->count(),
            'total_departments' => Department::where('institution_id', $institutionId)->count(),
        ];

        // Section C : Rooms
        $roomStats = Room::where('institution_id', $institutionId)
            ->select('room_type', DB::raw('count(*) as count'))
            ->groupBy('room_type')
            ->get()
            ->pluck('count', 'room_type');
        $totalRooms = $roomStats->sum();

        // Section D : Routine Table Overview
        $latestRoutines = Routine::with([
            'institution',
            'semester',
            'batch',
            'generatedBy'
        ])
            ->where('institution_id', $institutionId)
            ->latest()
            ->paginate(5);

        // Section E: Activity Log
        $activities = Activity::with('causer')
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($activity) {
                $subjectName = $activity->subject->title
                    ?? $activity->subject->name
                    ?? $activity->subject->room_type
                    ?? 'ID: ' . $activity->subject_id;
                return [
                    'id' => $activity->id,
                    'display_text' => class_basename($activity->subject_type) . " '{$subjectName}' {$activity->description}",
                    'causer_name' => $activity->causer->name ?? 'System',
                    'created_at' => $activity->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'routine_section' => [
                    'total' => $routineStats->total ?? 0,
                    'draft' => $routineStats->draft ?? 0,
                    'published' => $routineStats->published ?? 0,
                    'archived' => $routineStats->archieved ?? 0,
                ],
                'faculty_section' => $facultyStats,
                'room_section' => [
                    'total_rooms' => $totalRooms,
                    'room_type' => $roomStats,
                ],
                'routine_table' => RoutineListResource::collection($latestRoutines)->response()->getData(true),
                'activities' => $activities,
            ]
        ]);
    }
}
