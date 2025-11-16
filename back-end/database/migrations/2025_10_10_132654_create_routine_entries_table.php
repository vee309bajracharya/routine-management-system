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
        Schema::create('routine_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('routine_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_assignment_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->foreignId('time_slot_id')->constrained()->onDelete('cascade');
            $table->string('day_of_week'); //Sunday, Monday
            $table->enum('entry_type', ['lecture', 'practical'])->default('lecture');
            $table->boolean('is_cancelled')->default(false);
            $table->text('cancellation_reason')->nullable();
            $table->text('notes')->nullable();
            $table->enum('day', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])->nullable();
            $table->timestamps();
            $table->softDeletes();

            // indexes
            $table->index('routine_id');
            $table->index('course_assignment_id');
            $table->index('room_id');
            $table->index('time_slot_id');
            $table->index(['routine_id', 'day_of_week']);

            /* 
                unique constraint as to prevent double booking
                conflict case = same time_slot, same room ,same day
            */
            $table->unique(['routine_id','room_id','time_slot_id','day_of_week'],'unique_room_time_day');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routine_entries');
    }
};
