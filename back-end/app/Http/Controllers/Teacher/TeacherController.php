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
     * show()
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
            return $this->errorResponse('Failed to fetch profile', $e->getMessage());
        }
    }

    /**
     * update()
     * teacher updates basic fields (name,email,phone)
     * updates pwd
     * can't update department_id and employment_type on their own
     */
    public function update(Request $request)
    {
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

        DB::beginTransaction();
        try {
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
            return $this->errorResponse('Failed to update details', $e->getMessage());
        }
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
