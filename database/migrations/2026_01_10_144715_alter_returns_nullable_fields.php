<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('returns', function (Blueprint $table) {
            $table->date('return_date_actual')->nullable()->change();
            $table->enum('asset_condition', [
                'Baik',
                'Rusak',
                'Rusak Ringan',
                'Rusak Berat',
                'Perbaikan',
                'Belum Diperbaiki',
                'Belum Dikembalikan',
            ])->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('returns', function (Blueprint $table) {
            $table->date('return_date_actual')->nullable(false)->change();
            $table->enum('asset_condition', [
                'Baik',
                'Rusak',
                'Rusak Ringan',
                'Rusak Berat',
                'Perbaikan',
                'Belum Diperbaiki',
                'Belum Dikembalikan',
            ])->nullable(false)->change();
        });
    }
};
