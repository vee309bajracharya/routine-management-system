<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SemesterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('semesters')->insert([
            [
                'academic_year_id' => 1,
                'semester_name' => 'Eighth Semester',
                'semester_number' => 8,
                'start_date' => '2024-07-30',
                'end_date' => '2024-12-30',
                'is_active' => true, // Current semester
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        $this->command->info('Semesters seeded successfully');
    }
}
