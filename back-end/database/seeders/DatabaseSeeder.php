<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\TeacherSeeder;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\InstitutionSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            InstitutionSeeder::class,
            UserSeeder::class,
            DepartmentSeeder::class,
            TeacherSeeder::class,
        ]);
        $this->command->info('All seeders completed successfully');
  
    }
}
