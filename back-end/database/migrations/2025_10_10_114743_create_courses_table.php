<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('course_name');
            $table->string('code',50)->unique();
            $table->string('description')->nullable();
            $table->enum('course_type', ['Theory','Practical','Theory and Practical'])->default('Theory');
            $table->enum('status',['active','inactive'])->default('active');
            $table->integer('semester_number')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // indexes
            $table->index('institution_id');
            $table->index('department_id');
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
