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
        Schema::create('routines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->constrained()->onDelete('cascade');
            $table->foreignId('batch_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('generated_by')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['draft', 'published', 'archieved'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // indexes
            $table->index('institution_id');
            $table->index('semester_id');
            $table->index('batch_id');
            $table->index('status');
            $table->index(['semester_id', 'batch_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routines');
    }
};
