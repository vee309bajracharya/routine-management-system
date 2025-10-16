<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // get relationships to load based on user role
    private function getUserRelationships(string $role): array
    {
        return match ($role) {
            'teacher' => ['teacher.institution', 'teacher.department'],
            'admin', 'super_admin' => [],
            default => [],
        };
    }

    // login user and create a token
    public function login(Request $request)
    {
        try {
            // validate the request
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|min:8',
            ]);

            // find user by email
            $user = User::where('email', $request->email)->first();

            // check if user exists
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials. User not found',
                ], 401);
            }

            // check if user is active
            if ($user->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated. Please contact admin',
                ], 403);
            }

            // verify user's password
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => 'false',
                    'message' => 'Invalid credentials. Incorrect Password',
                ], 401);
            }

            // role-based user sanctum-token
            $token = $user->createToken(
                'auth_token',
                [$user->role]
            )->plainTextToken;

            // load relationship based on role
            $userData = $user->load($this->getUserRelationships($user->role));

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $userData->id,
                    'name' => $userData->name,
                    'email' => $userData->email,
                    'role' => $userData->role,
                    'phone' => $userData->phone,
                    'status' => $userData->status,
                    'teacher' => $user->role === 'teacher' ? $userData->teacher : null,
                ],
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during login',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // authenticated user details
    public function user(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => 'false',
                    'message' => 'Unauthorized',
                ], 401);
            }

            // load relationships
            $user->load($this->getUserRelationships($user->role));

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'teacher' => $user->role === 'teacher' ? $user->teacher : null,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => 'false',
                'message' => 'Failed to fetch user details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // logout user
    public function logout(Request $request)
    {
        try {
            // delete current access token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // logout from all devices
    public function logoutAll(Request $request)
    {
        try {
            //revoke all tokens
            $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out from all devices successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // refresh token
    public function refresh(Request $request)
    {
        try {
            $user = $request->user();
            if(!$user){
                return response()->json([
                    'success'=> false,
                    'message'=> 'User not authenticated',
                ],401);
            }

            $currentToken = $request->user()->currentAccessToken();
            if($currentToken){
                $currentToken->delete();
            }

            // create new token
            $token = $user->createToken(
                'auth_token',
                [$user->role]
            )->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Token refreshed successfully',
                'token' => $token,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token refresh failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
