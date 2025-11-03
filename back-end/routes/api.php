<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// No Auth required (Public Routes)
Route::prefix('auth')->group(function(){
    Route::post('/teacher-login', [AuthController::class, 'login']);
    Route::post('/admin-login',[AuthController::class, 'login']);
});

// Protected routes (Auth required)
Route::middleware(['auth:sanctum','prevent.back.history'])->group(function(){

    // Auth routes
    Route::prefix('auth')->group(function(){
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refreshCache']);
    });

    // admin routes
    Route::middleware(['check.role:admin'])->prefix('admin')->group(function(){

        // dashboard route
        Route::get('/dashboard', function (Request $request){
            return response()->json([
                'success'=> true,
                'message'=> 'Admin dashboard data',
                'user'=> $request->user(),
            ]);
        });
    });

    // teacher routes
        Route::middleware(['check.role:teacher'])->prefix('teacher')->group(function(){

        // dashboard route
        Route::get('/dashboard', function (Request $request){
            return response()->json([
                'success'=> true,
                'message'=> 'Teacher dashboard data',
                'user'=> $request->user(),
            ]);
        });
    });
});
