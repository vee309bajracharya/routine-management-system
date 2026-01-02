<?php

namespace App\Http\Controllers\Admin;

use App\Models\Department;
use App\Models\Teacher;
use App\Models\User;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    private const USER_CACHE_TTL = 3600;

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * 
     * get all users details with filters and pagination
     * extras: show available_days for role=>teacher
     */

    public function index(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $cacheKey = "institution:{$institutionId}:users:list:" . md5(json_encode($request->query()));

            $users = CacheService::remember($cacheKey, function () use ($institutionId, $request) {
                $query = User::where('institution_id', $institutionId)
                    ->with([
                        'teacher.department:id,department_name,code',
                        'teacher.availability' => function ($q) {
                            $q->where('is_available', true)
                                ->orderByRaw("FIELD(day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')");
                        }
                    ]);

                // === filters (role, search by name or email, department) ===

                if ($request->filled('role')) {
                    $query->where('role', $request->role);
                }

                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                }

                if ($request->filled('department')) {
                    $department = $request->department;
                    $query->whereHas('teacher.department', function ($q) use ($department) {
                        $q->where('code', 'like', "%{$department}%");
                    });
                }

                return $query->orderBy('created_at', 'desc')->paginate(15);
            }, 1800);

            return response()->json([
                'success' => true,
                'message' => 'Users fetched successfully',
                'data' => $users->map(function ($user) {
                    $data = [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'phone' => $user->phone,
                        'status' => $user->status,
                        'email_verified_at' => $user->email_verified_at,
                        'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    ];

                    // if role's teacher, add department, employment_type and teacher_availability info
                    if ($user->role === 'teacher' && $user->teacher) {

                        // department info
                        $data['department'] = $user->teacher->department ? [
                            'id' => $user->teacher->department->id,
                            'name' => $user->teacher->department->department_name,
                            'code' => $user->teacher->department->code,
                        ] : null;

                        $data['employment_type'] = $user->teacher->employment_type;

                        // format available_days
                        $availableDays = $user->teacher->availability->pluck('day_of_week')->unique()->values();
                        $dayAbbrevations = [
                            'Sunday' => 'Sun',
                            'Monday' => 'Mon',
                            'Tuesday' => 'Tue',
                            'Wednesday' => 'Wed',
                            'Thursday' => 'Thu',
                            'Friday' => 'Fri',
                            'Saturday' => 'Sat',
                        ];
                        $formattedDays = $availableDays->map(function ($day) use ($dayAbbrevations) {
                            return $dayAbbrevations[$day] ?? $day;
                        })->implode(' - '); // Sun - Wed
                        $data['available_days'] = $formattedDays ?: 'Not Set';
                    }
                    return $data;
                }),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // get single user details
    /**
     * @param mixed $id
     * @return \Illuminate\Http\JsonResponse
     * 
     * get specific user details with all relationships
     *  - accessible by both admin and teacher
     */
    public function show($id)
    {
        try {
            $institutionId = auth()->user()->institution_id;
            $cacheKey = CacheService::userModelKey($id);

            $user = CacheService::remember($cacheKey, function () use ($id, $institutionId) {
                return User::where('institution_id', $institutionId)
                    ->with([
                        'teacher.department:id,department_name,code',
                        'teacher.courseAssignments.course:id,course_name,code',
                        'teacher.courseAssignments.batch:id,batch_name,shift',
                        'teacher.availability' => function ($q) {
                            $q->orderByRaw("FIELD(day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')");
                        }
                    ])
                    ->findOrFail($id);
            }, self::USER_CACHE_TTL);

            // admin
            $data = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            ];

            // but for teacher, add extra info's to $data
            if ($user->role === 'teacher' && $user->teacher) {
                $data['teacher_info'] = [
                    'id' => $user->id,
                    'employment_type' => $user->teacher->employment_type,
                    'department' => $user->teacher->department ? [
                        'id' => $user->teacher->department->id,
                        'name' => $user->teacher->department->department_name,
                        'code' => $user->teacher->department->code,
                    ] : null,
                    'course_assignments' => $user->teacher->courseAssignments->map(function ($assignment) {
                        return [
                            'id' => $assignment->id,
                            'course' => [
                                'id' => $assignment->course->id,
                                'name' => $assignment->course->course_name,
                                'code' => $assignment->course->code,
                            ],
                            'batch' => [
                                'id' => $assignment->batch->id,
                                'name' => $assignment->batch->batch_name,
                                'shift' => $assignment->batch->shift,
                            ],
                        ];
                    }),
                    'availability' => $user->teacher->availability->map(function ($avail) {
                        return [
                            'id' => $avail->id,
                            'day_of_week' => $avail->day_of_week,
                            'time_range' => $avail->available_from->format('H:i') . ' - ' . $avail->available_to->format('H:i'),
                        ];
                    }),
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'User details fetched successfully',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }


    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * create new user based on role (admin or teacher)
     *  - only admin can create new users
     */
    public function store(Request $request)
    {
        //dynamic validation based on role
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,teacher',
            'phone' => 'nullable|string|max:10',
            'status' => 'nullable|in:active,inactive',
        ];
        // if role is teacher, extras
        if ($request->role === 'teacher') {
            $rules['department_id'] = 'required|exists:departments,id';
            $rules['employment_type'] = 'required|in:Full Time,Part Time,Guest';
        }

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();
            $institutionId = auth()->user()->institution_id;

            // if role->teacher, verify department belongs to institution
            if ($request->role === 'teacher') {
                $department = Department::where('id', $request->department_id)
                    ->where('institution_id', $institutionId)
                    ->first();
                if (!$department) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid department selection',
                    ], 422);
                }
            }

            // create new user
            $user = User::create([
                // admin
                'institution_id' => $institutionId,
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'phone' => $request->phone,
                'status' => $request->status ?? 'active',
            ]);
            // role = teacher, create teacher record
            $teacher = null;
            if ($request->role === 'teacher') {
                $teacher = Teacher::create([
                    'user_id' => $user->id,
                    'institution_id' => $institutionId,
                    'department_id' => $request->department_id,
                    'employment_type' => $request->employment_type,
                ]);
            }

            // cache clear
            CacheService::forgetPattern("institution:{$institutionId}:users:*");
            if ($request->role === 'teacher') {
                CacheService::forgetPattern("institution:{$institutionId}:teachers*");
            }

            DB::commit();

            // response for admin
            $data = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'status' => $user->status,
            ];
            //additional responses if, teacher
            if ($user->role === 'teacher' && $teacher) {
                $data['employment_type'] = $teacher->employment_type;
                $data['department'] = [
                    'id' => $department->id,
                    'name' => $department->department_name,
                    'code' => $department->code,
                ];
            }
            return response()->json([
                'success' => true,
                'message' => ucfirst($request->role) . ' created successfully',
                'data' => $data
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @param Request $request
     * @param mixed $id
     * @return \Illuminate\Http\JsonResponse
     * admin update details - name,email,phone and password ,
     * restrict admin to edit another admin's detail , 
     * admin also can update teacher's department_id and employment_type
     */
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();
            $currentUser = auth()->user();
            $institutionId = $currentUser->institution_id;
            $user = User::where('institution_id', $institutionId)->findOrFail($id);

            // GUARD
            if ($user->role === 'admin' && $currentUser->role === 'admin' && $user->id !== $currentUser->id) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'You are not allowed to edit another admin details'
                ], 403);
            }

            //validation for admin related basic fields
            $rules = [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $id,
                'phone' => 'nullable|string|max:10',
                'status' => 'sometimes|in:active,inactive',
            ];

            // pwd update validation
            if ($request->filled('password')) {
                $rules['current_password'] = 'required|string';
                $rules['password'] = 'required|string|min:8|confirmed';
                $rules['password_confirmation'] = 'required|string|min:8';
            }

            // admin can update teacher's department or employment
            if ($user->role === 'teacher' && $currentUser->role === 'admin') {
                $rules['department_id'] = 'sometimes|exists:departments,id';
                $rules['employment_type'] = 'sometimes|in:Full Time,Part Time,Guest';
            }

            $validator = Validator::make($request->all(), $rules);
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'error' => $validator->errors(),
                ], 422);
            }

            // update admin basic fields
            if ($request->has('name'))
                $user->name = $request->name;
            if ($request->has('email'))
                $user->email = $request->email;
            if ($request->has('phone'))
                $user->phone = $request->phone;
            if ($request->has('status'))
                $user->status = $request->status;

            //handle pwd update
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

            // update teacher-specific fields (department and employment_type)
            if ($user->role === 'teacher' && $currentUser->role === 'admin') {
                $teacher = $user->teacher;
                if ($teacher) {
                    if ($request->has('department_id')) {
                        // verify department belongs to institution
                        $department = Department::where('id', $request->department_id)
                            ->where('institution_id', $institutionId)
                            ->first();

                        if (!$department) {
                            DB::rollBack();
                            return response()->json([
                                'success' => false,
                                'message' => 'Invalid department selection'
                            ], 422);
                        }
                        $teacher->department_id = $request->department_id;
                    }
                    if ($request->has('employment_type')) {
                        $teacher->employment_type = $request->employment_type;
                    }
                    $teacher->save();
                }
            }

            // load full response for teacher
            $user->load([
                'teacher.department:id,department_name,code'
            ]);

            // clear related cache
            CacheService::forget(CacheService::userModelKey($id));
            CacheService::forget(CacheService::userKey($id));
            CacheService::forgetPattern("institution:{$institutionId}:users:*");
            if ($user->role === 'teacher' && $user->teacher) {
                CacheService::forgetPattern("institution:{$institutionId}:teachers*");
                CacheService::forget("teacher:{$user->teacher->id}:details");
            }

            DB::commit();

            // if pwd updated, revoke all tokens and force re-login
            if ($shouldLogout) {
                $user->tokens()->forceDelete(); //no soft delete
                return response()->json([
                    'success' => true,
                    'message' => 'Password updated successfully. Please login again.',
                    'require_login' => true
                ], 200);
            }

            $data = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'status' => $user->status,
            ];

            if ($user->role === 'teacher' && $user->teacher) {
                $data['employment_type'] = $user->teacher->employment_type;
                $data['department'] = $user->teacher->department ? [
                    'id' => $user->teacher->department->id,
                    'name' => $user->teacher->department->department_name,
                    'code' => $user->teacher->department->code,
                ] : null;
            }

            return response()->json([
                'success' => true,
                'message' => $user->role === 'teacher' ? 'Teacher details updated successfully' : 'User updated successfully',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\JsonResponse
     * delete()
     *  - restrict own deletion of current logged in admin
     *  - other admin's can be permanently deleted (based on role)
     *  - teacher's deletion
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();
            $currentUser = auth()->user();
            $institutionId = $currentUser->institution_id;
            $user = User::where('institution_id', $institutionId)->findOrFail($id);

            // prevent self deletion
            if ($user->id === $currentUser->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot delete your own account'
                ], 422);
            }

            // permanent delete
            if ($user->role === 'admin') {
                $user->forceDelete();
                $message = 'Admin deleted permanently';
            } else if ($user->role === 'teacher') {
                if ($user->teacher && $user->teacher->courseAssignments()->count() > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot delete teacher with active course assignments'
                    ], 422);
                }
                if ($user->teacher) {
                    $user->teacher->forceDelete();
                }
                $user->forceDelete();
                $message = 'Teacher deleted permanently';

            } else {
                $user->forceDelete();
                $message = 'User deleted permanently';
            }

            DB::commit();

            // clear caches
            CacheService::forget(CacheService::userModelKey($id));
            CacheService::forget(CacheService::userKey($id));
            CacheService::forgetPattern("institution:{$institutionId}:users:*");
            CacheService::forgetPattern("institution:{$institutionId}:teachers*");

            return response()->json([
                'success' => true,
                'message' => $message
            ], 200);


        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
