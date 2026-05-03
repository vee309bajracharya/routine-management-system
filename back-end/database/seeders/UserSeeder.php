<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;


class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([

            // admin for 'Demo Institution'
            [
                'institution_id' => 1,
                'name' => 'Institution Admin',
                'email' => 'admin@demo.edu.np',
                'role' => 'admin',
                'phone' => '9811111111',
                'status' => 'active',
                'email_verified_at' => null,
                'password' => Hash::make('admin_01_Demo'),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        $this->command->info('Users seeded successfully');

    }
}
