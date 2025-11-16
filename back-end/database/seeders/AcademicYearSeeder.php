<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AcademicYearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('academic_years')->insert([
            // Demo Institution - Departments Academic Year
            [
                'institution_id' => 1,
                'year_name' => 'BCA-2022',
                'start_date' => '2022-07-30',
                'end_date' => '2026-07-30',
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'year_name' => 'BSc-CSIT-2022',
                'start_date' => '2022-07-30',
                'end_date' => '2026-07-30',
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'year_name' => 'BIM-2022',
                'start_date' => '2022-07-30',
                'end_date' => '2026-07-30',
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'year_name' => 'BBM-2022',
                'start_date' => '2022-07-30',
                'end_date' => '2026-07-30',
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'year_name' => 'BBS-2022',
                'start_date' => '2022-07-30',
                'end_date' => '2026-07-30',
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
        $this->command->info('Academic Years seeded successfully');
    }
}
