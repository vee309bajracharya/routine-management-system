<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TimeSlotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('time_slots')->insert([
            // Morning classes
            [
                'institution_id' => 1,
                'department_id' => 1, //BCA
                'batch_id' => 1, // 2022 Batch
                'semester_id' => 1, // 7th
                'name' => 'Morning Period 1',
                'start_time' => '06:35',
                'end_time' => '07:50',
                'duration_minutes' => 60,
                'slot_type' => 'Lecture',
                'shift'=> 'Morning',
                'slot_order' => 1,
                'applicable_days' => json_encode(['Sunday', 'Monday', 'Tuesday']),
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'department_id' => 1,
                'batch_id' => 1, // 2022 Batch
                'semester_id' => 1, // 7th
                'name' => 'Break',
                'start_time' => '07:50',
                'end_time' => '08:20',
                'duration_minutes' => 30,
                'slot_type' => 'Break',
                'shift'=> 'Morning',
                'slot_order' => 2,
                'applicable_days' => json_encode(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'department_id' => 1,
                'batch_id' => 1, // 2022 Batch
                'semester_id' => 1, // 7th
                'name' => 'Morning Period 2',
                'start_time' => '08:20',
                'end_time' => '09:30',
                'duration_minutes' => 60,
                'slot_type' => 'Lecture',
                'shift'=> 'Morning',
                'slot_order' => 3,
                'applicable_days' => json_encode(['Sunday', 'Monday', 'Tuesday']),
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'department_id' => 1,
                'batch_id' => 1, // 2022 Batch
                'semester_id' => 1, // 7th
                'name' => 'Morning Period 1',
                'start_time' => '06:35',
                'end_time' => '07:50',
                'duration_minutes' => 60,
                'slot_type' => 'Lecture',
                'shift'=> 'Morning',
                'slot_order' => 4,
                'applicable_days' => json_encode(['Wednesday', 'Thursday', 'Friday']),
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],

            [
                'institution_id' => 1,
                'department_id' => 1,
                'batch_id' => 1, // 2022 Batch
                'semester_id' => 1, // 7th
                'name' => 'Morning Period 2',
                'start_time' => '08:20',
                'end_time' => '09:30',
                'duration_minutes' => 60,
                'slot_type' => 'Lecture',
                'shift'=> 'Morning',
                'slot_order' => 5,
                'applicable_days' => json_encode(['Wednesday', 'Thursday', 'Friday']),
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
        $this->command->info('Time slots seeded successfully');
    }
}
