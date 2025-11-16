<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('departments')->insert([
            [
                'institution_id' => 1,
                'department_name' => 'Bachelor in Computer Application',
                'code' => 'BCA',
                'head_teacher_id' => null,
                'description' => null,
                'status' => 'active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'department_name' => 'Bachelor of Science in Computer Science and Information Technology',
                'code' => 'BSc-CSIT',
                'head_teacher_id' => null,
                'description' => null,
                'status' => 'active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'department_name' => 'Bachelor in Information Management',
                'code' => 'BIM',
                'head_teacher_id' => null,
                'description' => null,
                'status' => 'active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'department_name' => 'Bachelor of Business Management',
                'code' => 'BBM',
                'head_teacher_id' => null,
                'description' => null,
                'status' => 'active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'department_name' => 'Bachelor in Business Studies',
                'code' => 'BBS',
                'head_teacher_id' => null,
                'description' => null,
                'status' => 'active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
