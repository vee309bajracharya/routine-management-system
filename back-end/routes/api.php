<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Routines\RoutineCRUDController;
use App\Http\Controllers\Routines\RoutineEntryController;

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

    // Admin routes
    Route::middleware(['check.role:admin'])->prefix('admin')->group(function(){

        // Admin dashboard route
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // Routines
        Route::prefix('routines')->group(function(){
            // CRUD Routes
            Route::get('/', [RoutineCRUDController::class, 'index']);
            Route::post('/',[RoutineCRUDController::class, 'store']);
            Route::get('/{id}', [RoutineCRUDController::class, 'show']);
            Route::put('/{id}', [RoutineCRUDController::class, 'update']);
            Route::delete('/{id}',[RoutineCRUDController::class, 'destroy']);
        });

        // Routine entries - Grid Operation
        Route::prefix('routine-entries')->group(function(){
            Route::post('/', [RoutineEntryController::class, 'addEntry']);
            Route::put('/{entryId}', [RoutineEntryController::class, 'updateEntry']);
            Route::delete('/{entryId}', [RoutineEntryController::class, 'deleteEntry']);
            Route::delete('/clear/{routineId}', [RoutineEntryController::class, 'clearRoutine']);
            Route::get('/grid/{routineId}', [RoutineEntryController::class, 'getRoutineGrid']);
        });
    });

    // Teacher routes
    Route::middleware(['check.role:teacher'])->prefix('teacher')->group(function(){

        // Teacher dashboard route
        Route::get('/dashboard', [TeacherDashboardController::class, 'index']);
    });
});
