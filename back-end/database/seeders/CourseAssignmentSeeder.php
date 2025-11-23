<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CourseAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('course_assignments')->insert([
            // 7th Semester bca course assign
            [
                'course_id' => 1, // Cyber Law
                'teacher_id' => 1,
                'batch_id' => 1, // 2022 BCA Batch
                'semester_id' => 1, // 7th Semester
                'department_id' => 1, //BCA
                'assignment_type' => 'Theory',
                'status' => 'active',
                'notes' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'course_id' => 2, // Cloud
                'teacher_id' => 2,
                'batch_id' => 1, // 2022 BCA Batch
                'semester_id' => 1, // 7th Semester
                'department_id' => 1, //BCA
                'assignment_type' => 'Theory and Practical',
                'status' => 'active',
                'notes' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'course_id' => 3, // SPM
                'teacher_id' => 3,
                'batch_id' => 1, // 2022 BCA Batch
                'semester_id' => 1, // 7th Semester
                'department_id' => 1, //BCA
                'assignment_type' => 'Theory and Practical',
                'status' => 'active',
                'notes' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'course_id' => 4, // E-gov
                'teacher_id' => 4,
                'batch_id' => 1, // 2022 BCA Batch
                'semester_id' => 1, // 7th Semester
                'department_id' => 1, //BCA
                'assignment_type' => 'Theory',
                'status' => 'active',
                'notes' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
