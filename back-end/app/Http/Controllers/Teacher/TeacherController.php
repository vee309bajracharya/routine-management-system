<?php

namespace App\Http\Controllers\Teacher;

use App\Models\RoutineEntry;
use App\Models\User;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\RateLimiter;

class TeacherController extends Controller
{
    private const USER_CACHE_TTL = 3600;
    private const TODAY_CLASSES_TTL = 300;

    /**
     * @return \Illuminate\Http\JsonResponse
     * get teacher's own profile details
     */
    public function show()
    {
        try {
            $userId = auth()->id();
            $institutionId = auth()->user()->institution_id;

            $cacheKey = CacheService::userModelKey($userId);

            $user = CacheService::remember($cacheKey, function () use ($userId, $institutionId) {
                return User::where('id', $userId)
                    ->where('institution_id', $institutionId)
                    ->firstOrFail();
            }, self::USER_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Profile fetched successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * teacher updates basic fields (name,email,phone)
     * updates pwd
     * can't update department_id and employment_type on their own
     */
    public function update(Request $request)
    {
        try {
            DB::beginTransaction();

            $userId = auth()->id();
            $institutionId = auth()->user()->institution_id;

            $user = User::where('id', $userId)
                ->where('institution_id', $institutionId)
                ->firstOrFail();

            // validation
            $rules = [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $userId,
                'phone' => 'nullable|string|max:10',
            ];

            // pwd update
            if ($request->filled('password')) {
                $rules['current_password'] = 'required|string';
                $rules['password'] = 'required|string|min:8|confirmed';
                $rules['password_confirmation'] = 'required|string|min:8';
            }

            $validator = Validator::make($request->all(), $rules);
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'error' => $validator->errors(),
                ], 422);
            }

            // update basic fields
            if ($request->has('name'))
                $user->name = $request->name;
            if ($request->has('email'))
                $user->email = $request->email;
            if ($request->has('phone'))
                $user->phone = $request->phone;

            // update pwd
            $shouldLogout = false;
            $ratekey = 'password-update:' . $user->id;

            if ($request->filled('password')) {

                // pwd update rate limit for 15mins
                if (RateLimiter::tooManyAttempts($ratekey, 3)) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Too many password change attempts. Try again after few minutes.'
                    ], 429);
                }
                RateLimiter::hit($ratekey, 900);

                // prevent using same pwd again
                if (Hash::check($request->password, $user->password)) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'New password cannot be same as the current password'
                    ], 422);
                }

                //verify current pwd
                if (!Hash::check($request->current_password, $user->password)) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Current password is incorrect'
                    ], 422);
                }
                //if correct
                $user->password = Hash::make($request->password);
                $shouldLogout = true;

                RateLimiter::clear($ratekey); //clear rate limiter on success
            }
            $user->save();

            // clear cache
            CacheService::forget(CacheService::userModelKey($userId));
            CacheService::forget(CacheService::userKey($userId));
            CacheService::forgetPattern("institution:{$institutionId}:users:*");
            if ($user->teacher) {
                CacheService::forgetPattern("institution:{$institutionId}:teachers*");
                CacheService::forget("teacher:{$user->teacher->id}:details");
            }

            DB::commit();

            // if pwd changed, revoke all tokens
            if ($shouldLogout) {
                $user->tokens()->forceDelete();
                return response()->json([
                    'success' => true,
                    'message' => 'Password updated successfully. Please login again.',
                    'require_login' => true
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * getSchedule function to view details of assigned schedule (act as index for teacher's account)
     */
    public function getSchedule(Request $request)
    {
        try {
            $teacherId = auth()->user()->teacher->id;

            $cacheKey = "teacher:{$teacherId}:schedule:list:" . md5(json_encode($request->all()));

            $result = CacheService::remember($cacheKey, function () use ($request, $teacherId) {

                $query = RoutineEntry::query()
                    ->whereHas('courseAssignment', function ($q) use ($teacherId) {
                        $q->where('teacher_id', $teacherId);
                    })
                    ->with([
                        'timeSlot:id,start_time,end_time',
                        'room:id,room_number,room_type',
                        'courseAssignment.course:id,course_name',
                        'courseAssignment.batch:id,batch_name,shift',
                    ]);

                // Filter by day
                if ($request->filled('day')) {
                    $query->where('day_of_week', $request->day);
                }

                // Filter by course
                if ($request->filled('course')) {
                    $course = $request->course;
                    $query->whereHas('courseAssignment.course', function ($q) use ($course) {
                        $q->where('course_name', 'like', "%{$course}%");
                    });
                }

                // Filter by batch
                if ($request->filled('batch')) {
                    $batch = $request->batch;
                    $query->whereHas('courseAssignment.batch', function ($q) use ($batch) {
                        $q->where('batch_name', 'like', "%{$batch}%");
                    });
                }

                $query->orderByRaw(
                    "FIELD(day_of_week, 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday')"
                );

                $perPage = $request->get('per_page', 10);
                $routines = $query->paginate($perPage);


                $data = $routines->getCollection()->map(function ($entry) {
                    return [
                        'id' => $entry->id,
                        'day' => $entry->day_of_week,

                        'batch' => [
                            'id' => $entry->courseAssignment->batch->id,
                            'name' => $entry->courseAssignment->batch->batch_name,
                            'shift' => $entry->courseAssignment->batch->shift,
                        ],

                        'course' => [
                            'id' => $entry->courseAssignment->course->id,
                            'name' => $entry->courseAssignment->course->course_name,
                        ],

                        'time_slot' => [
                            'id' => $entry->timeSlot->id,
                            'display_label' => "{$entry->timeSlot->start_time->format('H:i')} - {$entry->timeSlot->end_time->format('H:i')}",
                        ],

                        'room' => $entry->room ? [
                            'id' => $entry->room->id,
                            'number' => $entry->room->room_number,
                            'type' => $entry->room->room_type,
                        ] : null,
                    ];
                });

                return [
                    'data' => $data,
                    'pagination' => [
                        'current_page' => $routines->currentPage(),
                        'last_page' => $routines->lastPage(),
                        'per_page' => $routines->perPage(),
                        'total' => $routines->total(),
                    ]
                ];
            }, self::USER_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Schedule fetched successfully',
                'data' => $result['data'],
                'meta' => $result['pagination'],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get assigned schedules',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     * teacher's today's classes status - Ongoing and Upcoming classes
     */
    public function getTodayClasses()
    {
        try {
            $teacherId = auth()->user()->teacher->id;

            $today = now()->format('l');
            $now = now()->format('H:i');

            $cacheKey = "teacher:{$teacherId}:today-classes";

            $classes = CacheService::remember($cacheKey, function () use ($teacherId, $today, $now) {
                return RoutineEntry::where('day_of_week', $today)
                    ->whereHas('courseAssignment', function ($q) use ($teacherId) {
                        $q->where('teacher_id', $teacherId);
                    })
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

                        // schedule status
                        $status = match (true) {
                            $now >= $start && $now <= $end => 'Ongoing',
                            $now < $start => 'Upcoming',
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

                            'time_slot' => [
                                'start' => $start,
                                'end' => $end,
                                'display_label' => "{$entry->timeSlot->start_time->format('H:i')} - {$entry->timeSlot->end_time->format('H:i')}",
                            ],

                            'room' => [
                                'id' => $entry->room->id,
                                'name' => $entry->room->name,
                                'number' => $entry->room->room_number,
                                'type' => $entry->room->room_type,
                            ]
                        ];
                    })
                    ->sortBy(fn($item) => $item['time_slot']['start'])
                    ->values()
                    ->take(2);
            }, self::TODAY_CLASSES_TTL);

            return response()->json([
                'success' => true,
                'message' => $classes->isEmpty() ? 'No further classes right now' : 'Today classes schedule fetched successfully',
                'data' => $classes,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch today classes schedule',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
