<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\TeacherAvailability;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TeacherAvailabilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('teacher_availability')->truncate();
        
        DB::table('teacher_availability')->insert([
            //Teacher 1 as teacher_id : 1 referring to user_id:2
            [
                'teacher_id' => 1,
                'day_of_week' => 'Sunday',
                'available_from' => '06:15',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],

            [
                'teacher_id' => 1,
                'day_of_week' => 'Monday',
                'available_from' => '06:15',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],

            [
                'teacher_id' => 1,
                'day_of_week' => 'Tuesday',
                'available_from' => '06:15',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],
            // ================================
            [
                'teacher_id' => 2,
                'day_of_week' => 'Wednesday',
                'available_from' => '06:15',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],
            [
                'teacher_id' => 2,
                'day_of_week' => 'Thursday',
                'available_from' => '06:15',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],
            [
                'teacher_id' => 2,
                'day_of_week' => 'Friday',
                'available_from' => '06:15',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],
            // ================================
            [
                'teacher_id' => 3,
                'day_of_week' => 'Sunday',
                'available_from' => '06:15',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],

            [
                'teacher_id' => 3,
                'day_of_week' => 'Monday',
                'available_from' => '06:15',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],

            [
                'teacher_id' => 3,
                'day_of_week' => 'Tuesday',
                'available_from' => '06:15',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],
            // ================================
            [
                'teacher_id' => 4,
                'day_of_week' => 'Wednesday',
                'available_from' => '08:00',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],
            [
                'teacher_id' => 4,
                'day_of_week' => 'Thursday',
                'available_from' => '08:00',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],
            [
                'teacher_id' => 4,
                'day_of_week' => 'Friday',
                'available_from' => '08:00',
                'available_to' => '10:00',
                'is_available' => true,
                'notes' => 'Morning Schedule'
            ],
        ]);
    }
}
