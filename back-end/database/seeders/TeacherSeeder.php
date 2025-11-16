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
                'user_id' => 2,
                'institution_id' => 1,
                'department_id'=> 1,
                'employment_type' => 'Part Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id' => 3,
                'institution_id' => 1,
                'department_id'=> 1,
                'employment_type' => 'Part Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id' => 4,
                'institution_id' => 1,
                'department_id'=> 1,
                'employment_type' => 'Part Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id' => 5,
                'institution_id' => 1,
                'department_id'=> 2,
                'employment_type' => 'Part Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id' => 6,
                'institution_id' => 1,
                'department_id'=> 2,
                'employment_type' => 'Full Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id' => 7,
                'institution_id' => 1,
                'department_id'=> 3,
                'employment_type' => 'Full Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id' => 8,
                'institution_id' => 1,
                'department_id'=> 4,
                'employment_type' => 'Full Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id' => 9,
                'institution_id' => 1,
                'department_id'=> 5,
                'employment_type' => 'Full Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id' => 10,
                'institution_id' => 1,
                'department_id'=> 3,
                'employment_type' => 'Full Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id' => 11,
                'institution_id' => 1,
                'department_id'=> 1,
                'employment_type' => 'Full Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id' => 12,
                'institution_id' => 1,
                'department_id'=> 4,
                'employment_type' => 'Part Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
