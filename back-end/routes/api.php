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
Route::middleware('auth:sanctum')->group(function(){

    // Auth routes
    Route::prefix('auth')->group(function(){
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });
});
