<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('rooms')->insert([

            // Classrooms
            [
                'institution_id' => 1,
                'name' => 'Room 301',
                'room_number' => '301',
                'building' => null,
                'room_type' => 'Classroom',
                'is_available' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'name' => 'Room 302',
                'room_number' => '302',
                'building' => null,
                'room_type' => 'Classroom',
                'is_available' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'name' => 'Room 303',
                'room_number' => '303',
                'building' => null,
                'room_type' => 'Classroom',
                'is_available' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],

            // Labs
            [
                'institution_id' => 1,
                'name' => 'Computer Lab 1',
                'room_number' => 'CLab-1',
                'building' => null,
                'room_type' => 'Lab',
                'is_available' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'name' => 'Computer Lab 2',
                'room_number' => 'CLab-2',
                'building' => null,
                'room_type' => 'Lab',
                'is_available' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'name' => 'Computer Lab 3',
                'room_number' => 'CLab-3',
                'building' => null,
                'room_type' => 'Lab',
                'is_available' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'institution_id' => 1,
                'name' => 'Network Lab 1',
                'room_number' => 'NLab-1',
                'building' => null,
                'room_type' => 'Lab',
                'is_available' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
        $this->command->info('Rooms seeded successfully');
    }
}
