<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Api\DropdownController;
use App\Http\Controllers\Teacher\TeacherController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\InstitutionController;
use App\Http\Controllers\Admin\AcademicYearController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Routines\RoutineCRUDController;
use App\Http\Controllers\Routines\RoutineEntryController;
use App\Http\Controllers\Routines\RoutineExportController;
use App\Http\Controllers\Routines\RoutineVersionController;
use App\Http\Controllers\Teacher\TeacherDashboardController;

// No Auth required (Public Routes)
Route::prefix('auth')->group(function () {
    Route::post('/teacher-login', [AuthController::class, 'login']);
    Route::post('/admin-login', [AuthController::class, 'login']);
});

// Protected routes (Auth required)
Route::middleware(['auth:sanctum', 'prevent.back.history'])->group(function () {

    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refreshCache']);
    });

    // Admin routes
    Route::middleware(['check.role:admin'])->prefix('admin')->group(function () {

        // Admin dashboard route
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // Institution settings
        Route::prefix('institution')->group(function () {
            Route::get('/', [InstitutionController::class, 'show']);
            Route::post('/update', [InstitutionController::class, 'update']);
            Route::delete('/logo', [InstitutionController::class, 'deleteLogo']);
        });

        // User mgmt routes
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::get('/{id}', [UserController::class, 'show']);
            Route::post('/', [UserController::class, 'store']);
            Route::put('/{id}', [UserController::class, 'update']);
            Route::delete('/{id}', [UserController::class, 'destroy']);
        });

        // Department routes
        Route::prefix('departments')->group(function () {
            Route::get('/', [DepartmentController::class, 'index']);
            Route::post('/', [DepartmentController::class, 'store']);
            Route::put('/{id}', [DepartmentController::class, 'update']);
            Route::delete('/{id}', [DepartmentController::class, 'destroy']);
        });

        // Academic Year routes
        Route::prefix('academic-years')->group(function () {
            Route::get('/', [AcademicYearController::class, 'index']);
            Route::post('/', [AcademicYearController::class, 'store']);
            Route::put('/{id}', [AcademicYearController::class, 'update']);
            Route::delete('/{id}', [AcademicYearController::class, 'destroy']);
        });

        // Dropdown routes
        Route::prefix('dropdowns')->group(function () {

            //mainly for RoutineEntry
            Route::get('/departments/{institutionId}', [DropdownController::class, 'getDepartments']);
            Route::get('/academic-years', [DropdownController::class, 'getAcademicYears']);
            Route::get('/semesters', [DropdownController::class, 'getSemesters']);
            Route::get('/batches', [DropdownController::class, 'getBatches']);
            Route::get('/course-assignments', [DropdownController::class, 'getCourseAssignments']);
            Route::get('/teachers', [DropdownController::class, 'getTeachers']);
            Route::get('/courses', [DropdownController::class, 'getCourses']);
            Route::get('/rooms', [DropdownController::class, 'getRooms']);
            Route::get('/time-slots', [DropdownController::class, 'getTimeSlots']);

            // RoutineCreation dropdowns
            Route::get('/all-semesters', [DropdownController::class, 'getAllSemesters']);
            Route::get('/batches-by-semester', [DropdownController::class, 'getBatchesBySemester']);
        });

        // Routines
        Route::prefix('routines')->group(function () {
            // CRUD Routes
            Route::get('/', [RoutineCRUDController::class, 'index']);
            Route::post('/', [RoutineCRUDController::class, 'store']);
            Route::get('/{id}', [RoutineCRUDController::class, 'show']);
            Route::put('/{id}', [RoutineCRUDController::class, 'update']);
            Route::delete('/{id}', [RoutineCRUDController::class, 'destroy']);
            Route::put('/archive/{id}', [RoutineCRUDController::class, 'archive']);
            Route::post('/restore/{id}', [RoutineCRUDController::class, 'restore']);

            // Routine versions
            Route::post('/save', [RoutineVersionController::class, 'saveRoutine']);
            Route::get('/{routineId}/saved-versions', [RoutineVersionController::class, 'getSavedRoutines']);
            Route::post('/load/{savedRoutineId}', [RoutineVersionController::class, 'loadSavedRoutine']);
            Route::delete('/saved/{savedRoutineId}', [RoutineVersionController::class, 'deleteSavedVersion']);
            Route::get('/{savedRoutineId}/preview', [RoutineVersionController::class, 'previewSavedRoutine']);

            // Routine Download
            Route::get('/export/pdf/{routineId}', [RoutineExportController::class, 'exportPdf']);
        });

        // Routine entries - Grid Operation
        Route::prefix('routine-entries')->group(function () {
            Route::post('/', [RoutineEntryController::class, 'addEntry']);
            Route::put('/{entryId}', [RoutineEntryController::class, 'updateEntry']);
            Route::delete('/{entryId}', [RoutineEntryController::class, 'deleteEntry']);
            Route::delete('/clear/{routineId}', [RoutineEntryController::class, 'clearRoutine']);
            Route::post('/{entryId}/restore', [RoutineEntryController::class, 'restoreEntry']);
            Route::get('/grid/{routineId}', [RoutineEntryController::class, 'getRoutineGrid']);
            Route::post('/copy', [RoutineEntryController::class, 'copyEntries']);
        });

    });

    // Teacher routes
    Route::middleware(['check.role:teacher'])->prefix('teacher')->group(function () {

        Route::get('/dashboard', [TeacherDashboardController::class, 'index']); //dashboard
        Route::get('/profile', [TeacherController::class, 'show']); //show profile details
        Route::put('/update-profile', [TeacherController::class, 'update']); //update profile details
        Route::get('/today-classes', [TeacherController::class, 'getTodayClasses']); // get today's schedule status
        Route::get('/schedule', [TeacherController::class, 'getSchedule']); // get all assigned schedules
    });
});
