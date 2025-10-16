<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TeacherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('teachers')->insert([
            [
                // Demo Institution teacher
                'user_id' => 2,
                'institution_id' => 1,
                'department_id' => 1, // Computer Science Engineering
                'employment_type' => 'full_time',
                'employee_code' => 'DI-CSE-001',
                'joining_date' => '2018-08-15',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
