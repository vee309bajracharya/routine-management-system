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
        Schema::table('routines', function (Blueprint $table) {
            //expiration notification track
            $table->boolean('expiration_notified')->default(false)->after('effective_to');
            $table->timestamp('expiration_notified_at')->nullable()->after('expiration_notified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('routines', function (Blueprint $table) {
            $table->dropColumn(['expiration_notified', 'expiration_notified_at']);
        });
    }
};
