<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Services\CacheService;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|min:8',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Check credentials
            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials',
                ], 401);
            }

            $user = Auth::user();

            // Generate token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Cache user data with roles
            $userData = CacheService::remember(
                CacheService::userKey($user->id),
                fn() => $this->getUserData($user),
                3600
            );

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => $userData,
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Login error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during login',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get authenticated user details
     */
    public function user(Request $request)
    {
        try {
            $user = $request->user();

            // Try to get from cache first
            $userData = CacheService::remember(
                CacheService::userKey($user->id),
                fn() => $this->getUserData($user),
                3600
            );

            return response()->json([
                'success' => true,
                'data' => $userData,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Get user error', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user data',
            ], 500);
        }
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();

            // Clear user cache
            CacheService::forget(CacheService::userKey($user->id));

            // Revoke all tokens
            $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Logout error', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to logout',
            ], 500);
        }
    }

    /**
     * Get user data with relationships
     */
    private function getUserData(User $user): array
    {
        // common data
        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
            'institution_id' => $user->institution_id,
        ];
        // additional data for teachers
        if ($user->role === 'teacher') {
            $data['teacher_id'] = $user->teacher?->id;
            $data['department_id'] = $user->teacher?->department_id;
        }

        return $data;
    }

    /**
     * Refresh user cache
     */
    public function refreshCache(Request $request)
    {
        try {
            $user = $request->user();

            // Clear existing cache
            CacheService::forget(CacheService::userKey($user->id));

            // Rebuild cache
            $userData = CacheService::remember(
                CacheService::userKey($user->id),
                fn() => $this->getUserData($user),
                3600
            );

            return response()->json([
                'success' => true,
                'message' => 'Cache refreshed successfully',
                'data' => $userData,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Cache refresh error', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh cache',
            ], 500);
        }
    }

    /**
     * forgot password
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Email not found',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = Password::sendResetLink(
            $request->only('email'),
            function ($user, $token) {
                $user->sendPasswordResetNotification($token);
            }
        );

        return $status === Password::RESET_LINK_SENT ?
            response()->json(['success' => true, 'message' => 'Password reset link sent to your mail'], 200)
            : response()->json(['success' => false, 'message' => 'Failed to send Password reset link'], 500);
    }

    /**
     * resetPassword
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|min:8|confirmed',
            'password_confirmation' => 'required|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                // Laravel Broker ensures $user is found before calling this closure
                $user->password = Hash::make($password);
                $user->setRememberToken(Str::random(60));
                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Password has been reset successfully.'
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => __($status)
        ], 400);
    }

}