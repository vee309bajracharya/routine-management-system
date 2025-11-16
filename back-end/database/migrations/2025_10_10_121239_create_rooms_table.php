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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->onDelete('cascade');
            $table->string('name')->unique();
            $table->string('room_number')->unique();
            $table->string('building')->unique()->nullable(); // 'Block A'
            $table->enum('room_type',['Lecture Hall','Lab','Classroom','Seminar Hall','Auditorium'])->default('Classroom');
            $table->boolean('is_available')->default(true);
            $table->enum('status',['active','inactive','maintenance'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            // indexes
            $table->index('institution_id');
            $table->index(['institution_id','room_number']);
            $table->index('room_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
