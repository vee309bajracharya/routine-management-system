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
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('semester_id')->constrained()->onDelete('cascade');
            $table->string('batch_name', 100); // 'Batch A', 'Section 1', Class 10-A'
            $table->string('code', 50)->unique()->nullable(); // 'BIT-2022-A'
            $table->integer('year_level');
            $table->enum('shift', ['Morning', 'Day', 'Evening'])->default('Morning');
            $table->enum('status', ['active', 'inactive', 'completed'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            // indexes
            $table->index('institution_id');
            $table->index('semester_id');
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
