<?php

namespace Database\Seeders;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\RoomSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\BatchSeeder;
use Database\Seeders\CourseSeeder;
use Database\Seeders\TeacherSeeder;
use Database\Seeders\SemesterSeeder;
use Database\Seeders\TimeSlotSeeder;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\InstitutionSeeder;
use Database\Seeders\AcademicYearSeeder;
use Database\Seeders\CourseAssignmentSeeder;
use Database\Seeders\TeacherAvailabilitySeeder;

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
            AcademicYearSeeder::class,
            SemesterSeeder::class,
            BatchSeeder::class,
            CourseSeeder::class,
            RoomSeeder::class,
            TimeSlotSeeder::class,
            CourseAssignmentSeeder::class,
            TeacherAvailabilitySeeder::class,
        ]);
        $this->command->info('All seeders completed successfully');
  
    }
}
