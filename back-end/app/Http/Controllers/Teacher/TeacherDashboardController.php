<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TeacherDashboardController extends Controller
{
    public function index(Request $request){
        return response()->json([
            'success'=> true,
            'message'=> 'Teacher Dashboard Index',
            'user'=> $request->user(),
        ]);
    }
}
