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
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->string('institution_name');
            $table->enum('type', ['University','College','School','Institute'])->default('College');
            $table->string('address')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone',10)->nullable();
            $table->string('logo')->nullable();
            $table->json('settings')->nullable();
            $table->enum('status', ['active','inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};
