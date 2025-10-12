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
        Schema::create('course_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('batch_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->constrained()->onDelete('cascade');
            $table->integer('weekly_hours')->nullable()->default(3); //total hrs per week for this assignment
            $table->enum('assignment_type', ['theory','practical','theory and practical'])->default('theory');
            $table->date('assigned_date')->nullable();
            $table->enum('status', ['active','completed','cancelled'])->default('active');
            $table->string('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // indexes
            $table->index('course_id');
            $table->index('teacher_id');
            $table->index('batch_id');
            $table->index('semester_id');

            // unique constraint: one teacher->per course,per batch,per semester
            $table->unique(['course_id','batch_id','semester_id','assignment_type'],'unique_course_batch_semester');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_assignments');
    }
};
