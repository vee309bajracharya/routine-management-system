<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;


class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('courses')->insert([
            // 8th Semester Courses
            [
                'institution_id' => 1,
                'department_id' => 1,
                'course_name' => 'Cyber Law and Prof. Ethics',
                'code' => 'CACS-401',
                'description' => null,
                'course_type' => 'Theory',
                'status' => 'active',
                'semester_number' => 8,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'department_id' => 1,
                'course_name' => 'Cloud Computing',
                'code' => 'CACS-402',
                'description' => null,
                'course_type' => 'Theory and Practical',
                'status' => 'active',
                'semester_number' => 8,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'department_id' => 1,
                'course_name' => 'Software Project Management',
                'code' => 'CACS-403',
                'description' => null,
                'course_type' => 'Theory and Practical',
                'status' => 'active',
                'semester_number' => 8,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'department_id' => 1,
                'course_name' => 'E-Governance',
                'code' => 'CACS-404',
                'description' => null,
                'course_type' => 'Theory',
                'status' => 'active',
                'semester_number' => 8,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
           
        ]);

        $this->command->info('Courses seeded successfully');
    }
}
