<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoutineController;
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

    // Admin routes
    Route::middleware(['check.role:admin'])->prefix('admin')->group(function(){

        // dashboard route
        Route::get('/dashboard', function (Request $request){
            return response()->json([
                'success'=> true,
                'message'=> 'Admin dashboard data',
                'user'=> $request->user(),
            ]);
        });

        // Routine Management Routes
        Route::prefix('routines')->group(function(){
            // list all routines with filters as ?status=draft&semester_id=A&batch_id=B
            Route::get('/all-routines', [RoutineController::class, 'index']);
            // create new routine
            Route::post('/new-routine',[RoutineController::class, 'store']);
            //show specific routine details
            Route::get('/{id}', [RoutineController::class, 'show']);
            // update routine data
            Route::put('/{id}', [RoutineController::class, 'update']);
            // delete routine
            Route::delete('/{id}',[RoutineController::class, 'destroy']);
        });

        // Routine Grid Entry
        Route::prefix('routine-entries')->group(function(){
            //new routine entry to grid
            Route::post('/new', [RoutineController::class, 'addEntry']);
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
