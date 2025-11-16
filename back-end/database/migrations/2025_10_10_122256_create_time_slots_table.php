<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->foreignId('batch_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->constrained()->onDelete('cascade');
            $table->string('name'); // 'Period 1'
            $table->time('start_time', 0); //only hours and minutes
            $table->time('end_time', 0);
            $table->integer('duration_minutes'); //45mins,
            $table->enum('slot_type', ['Lecture', 'Break', 'Practical'])->default('Lecture');
            $table->integer('slot_order')->default(1); //sorting
            $table->json('applicable_days')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // indexes
            $table->index('institution_id');
            $table->index('department_id');
            $table->index(['institution_id', 'start_time']);
            $table->index('slot_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_slots');
    }
};
