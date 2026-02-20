<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

/**
 * Welcome Route - Routine Homepage
 */
Route::get('/', function () {
    $path = public_path('app/index.html');
    return File::exists($path) ? File::get($path) : abort(404);
});


/**
 * Asset Helper
 */
Route::get('/app/assets/{file}', function ($file) {
    $path = public_path("app/assets/{$file}");

    if (!File::exists($path)) {
        abort(404);
    }

    $type = File::mimeType($path);
    return Response::file($path, [
        'Content-Type' => $type
    ]);
});

/**
 * React SPA Entry Point
 */
Route::fallback(function () {
    $path = public_path('app/index.html');
    
    if (File::exists($path)) {
        return File::get($path);
    }

    return response()->json(['error' => 'App build missing'], 404);
});

