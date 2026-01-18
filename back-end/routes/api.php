<?php

use App\Http\Controllers\Student\PublicMetadataController;
use App\Http\Controllers\Student\PublicRoutineController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\BatchController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Api\DropdownController;
use App\Http\Controllers\Admin\SemesterController;
use App\Http\Controllers\Admin\TimeSlotController;
use App\Http\Controllers\Teacher\TeacherController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\InstitutionController;
use App\Http\Controllers\Admin\AcademicYearController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Routines\RoutineCRUDController;
use App\Http\Controllers\Routines\RoutineEntryController;
use App\Http\Controllers\Admin\CourseAssignmentController;
use App\Http\Controllers\Routines\RoutineExportController;
use App\Http\Controllers\Api\TeacherAvailabilityController;
use App\Http\Controllers\Routines\RoutineVersionController;
use App\Http\Controllers\Teacher\TeacherDashboardController;

// public routes for students
Route::prefix('public')->group(function () {
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('/{institutionId}/departments', [PublicMetadataController::class, 'getDepartments']);
        Route::get('/department/{deptId}/academic-structure', [PublicMetadataController::class, 'getDeptAcademicStructure']);
        Route::get('/view-routine', [PublicRoutineController::class, 'getPublishedRoutine'])->name('public.routine.view')->middleware('signed');
        Route::post('/generate-link', [PublicRoutineController::class, 'generateSecureLink'])->middleware('throttle:10,1');
    });
});


// public auth routes for admin and teacher
Route::prefix('auth')->group(function () {
    Route::middleware('throttle:60,1')->group(function () {
        Route::post('/teacher-login', [AuthController::class, 'login']);
        Route::post('/admin-login', [AuthController::class, 'login']);
    });
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

        // dashboard route
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // activity log route
        Route::prefix('activity-log')->group(function () {
            Route::get('/index', [ActivityLogController::class, 'index']);
            Route::get('/show/{id}', [ActivityLogController::class, 'show']);
        });

        // ===== Academic Details Components Routes ======

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

        // Semester routes
        Route::prefix('semesters')->group(function () {
            Route::get('/', [SemesterController::class, 'index']);
            Route::post('/', [SemesterController::class, 'store']);
            Route::put('/{id}', [SemesterController::class, 'update']);
            Route::delete('/{id}', [SemesterController::class, 'destroy']);
        });

        // Batch routes
        Route::prefix('batches')->group(function () {
            Route::get('/', [BatchController::class, 'index']);
            Route::post('/', [BatchController::class, 'store']);
            Route::put('/{id}', [BatchController::class, 'update']);
            Route::delete('/{id}', [BatchController::class, 'destroy']);
        });

        // Room routes
        Route::prefix('rooms')->group(function () {
            Route::get('/', [RoomController::class, 'index']);
            Route::post('/', [RoomController::class, 'store']);
            Route::put('/{id}', [RoomController::class, 'update']);
            Route::delete('/{id}', [RoomController::class, 'destroy']);
        });

        // Course routes
        Route::prefix('courses')->group(function () {
            Route::get('/', [CourseController::class, 'index']);
            Route::get('/{id}', [CourseController::class, 'show']);
            Route::post('/', [CourseController::class, 'store']);
            Route::put('/{id}', [CourseController::class, 'update']);
            Route::delete('/{id}', [CourseController::class, 'destroy']);
        });

        // Timeslot routes
        Route::prefix('time-slots')->group(function () {
            Route::get('/', [TimeSlotController::class, 'index']);
            Route::get('/{id}', [TimeSlotController::class, 'show']);
            Route::post('/', [TimeSlotController::class, 'store']);
            Route::put('/{id}', [TimeSlotController::class, 'update']);
            Route::delete('/{id}', [TimeSlotController::class, 'destroy']);
        });

        // Course Assignment routes
        Route::prefix('course-assignments')->group(function () {
            Route::get('/', [CourseAssignmentController::class, 'index']);
            Route::get('/{id}', [CourseAssignmentController::class, 'show']);
            Route::post('/', [CourseAssignmentController::class, 'store']);
            Route::put('/{id}', [CourseAssignmentController::class, 'update']);
            Route::delete('/{id}', [CourseAssignmentController::class, 'destroy']);
        });

        // Teacher Availability routes
        Route::prefix('teacher-availability')->group(function () {
            Route::get('/', [TeacherAvailabilityController::class, 'index']);
            Route::post('/', [TeacherAvailabilityController::class, 'store']);
            Route::put('/{id}', [TeacherAvailabilityController::class, 'update']);
            Route::delete('/{id}', [TeacherAvailabilityController::class, 'destroy']);
        });

        // ===== Academic Details Components Routes End ======

        /**
         * Dropdown Routes(DR)
         *  - DR1 : Mainly for 'Create Routine Entry' Form
         *  - DR2: Mainly for 'Create Routine' Form
         *  - DR3: for 'Academic Details' components Create Form
         */
        Route::prefix('dropdowns')->group(function () {

            // DR1 
            Route::get('/departments/{institutionId}', [DropdownController::class, 'getDepartments']);
            Route::get('/academic-years', [DropdownController::class, 'getAcademicYears']);
            Route::get('/semesters', [DropdownController::class, 'getSemesters']);
            Route::get('/batches', [DropdownController::class, 'getBatches']);
            Route::get('/course-assignments', [DropdownController::class, 'getCourseAssignments']);
            Route::get('/rooms', [DropdownController::class, 'getRooms']);
            Route::get('/time-slots', [DropdownController::class, 'getTimeSlots']);

            // DR2
            Route::get('/all-semesters', [DropdownController::class, 'getAllSemesters']);
            Route::get('/batches-by-semester', [DropdownController::class, 'getBatchesBySemester']);

            // DR3
            Route::get('/teachers', [DropdownController::class, 'getTeachers']); // for HOD selection in Departments
            Route::get('/all-academic-years', [DropdownController::class, 'getAllAcademicYears']); // for Semester creation
            Route::get('/semesters-by-department', [DropdownController::class, 'getSemestersByDepartment']); // for Batches and Courses creation
            Route::get('/courses', [DropdownController::class, 'getCourses']); //for Course Assignment creation

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

        Route::get('/dashboard', [TeacherDashboardController::class, 'index']); //dashboard with todayClasses and getSchedule functionality
        Route::get('/profile', [TeacherController::class, 'show']); //show profile details
        Route::put('/update-profile', [TeacherController::class, 'update']); //update profile details
    });
});
