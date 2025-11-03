<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
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
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role'=> $user->role,
            'status'=> $user->status,
            'teacher' => $user->teacher()->first(['id', 'institution_id', 'department_id',]),
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'deleted_at' => $user->deleted_at,
        ];
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
}