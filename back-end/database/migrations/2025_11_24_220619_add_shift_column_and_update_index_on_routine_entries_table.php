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
        Schema::table('routine_entries', function (Blueprint $table) {

            // 'shift' as new column
            $table->enum('shift', ['Morning', 'Afternoon', 'Evening'])->default('Morning');

            // old unique index drop
            $table->dropUnique('unique_room_time_day');

            //new unique index inc. 'shift'
            $table->unique(
                ['room_id', 'time_slot_id', 'day_of_week', 'routine_id', 'shift'],
                'routine_entries_unique_room_day_time_routine_shift'
            ); //A room can't be used by two different batches/semesters at the same time but it can be reused inside the same routine (same batch-semester).
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('routine_entries', function (Blueprint $table) {
            //
        });
    }
};
