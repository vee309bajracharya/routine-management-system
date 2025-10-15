<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class InstitutionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('institutions')->insert([
            [
                'institution_name' => 'Demo Institution',
                'type' => 'college',
                'address' => 'Dhulikhel',
                'contact_email' => 'info@demo.edu.np',
                'contact_phone' => '01-6699887',
                'logo' => null,
                'settings' => json_encode([
                    'working_days' => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    'session_duration' => 45,
                    'break_duration' => 30,
                ]),
                'status' => 'active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        $this->command->info('Institution seeded successfully');
    }
}
