<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class BatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('batches')->insert([
            [
                'institution_id' => 1,
                'department_id' => 1, // BCA
                'semester_id' => 1, // Eighth sem
                'batch_name' => '2022 BCA Batch',
                'code' => 'BCA-2022',
                'year_level' => 4, //4th year BCA
                'shift' => 'Morning',
                'status' => 'active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        $this->command->info('Batches seeded successfully');
    }
}
