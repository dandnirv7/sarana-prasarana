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
        Schema::create('borrowings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->date('borrow_date');
            $table->date('return_date')->nullable();
            $table->date('actual_return_date')->nullable();
            $table->enum('asset_condition', ['Baik', 'Rusak', 'Perbaikan'])->nullable();
            $table->enum('status', ['Pending', 'Disetujui', 'Ditolak', 'Dikembalikan']);
            $table->timestamps();
        });    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrowings');
    }
};
