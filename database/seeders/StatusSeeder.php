<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Status;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Status::create([
            'name' => 'Menunggu',
            'type' => 'borrowing',
            'description' => 'Peminjaman sedang menunggu persetujuan',
        ]);

        Status::create([
            'name' => 'Disetujui',
            'type' => 'borrowing',
            'description' => 'Peminjaman telah disetujui',
        ]);

        Status::create([
            'name' => 'Ditolak',
            'type' => 'borrowing',
            'description' => 'Peminjaman ditolak',
        ]);

        Status::create([
            'name' => 'Dikembalikan',
            'type' => 'borrowing',
            'description' => 'Peminjaman dikembalikan',
        ]);

        Status::create([
            'name' => 'Hilang',
            'type' => 'borrowing',
            'description' => 'Peminjaman dikembalikan',
        ]);

        Status::create([
            'name' => 'Dikembalikan',
            'type' => 'asset',
            'description' => 'Aset dikembalikan',
        ]);

        Status::create([
            'name' => 'Tersedia',
            'type' => 'asset',
            'description' => 'Aset tersedia untuk dipinjam',
        ]);

        Status::create([
            'name' => 'Dipinjam',
            'type' => 'asset',
            'description' => 'Aset sedang dipinjam',
        ]);

        Status::create([
            'name' => 'Rusak',
            'type' => 'asset',
            'description' => 'Aset memerlukan perbaikan',
        ]);
        
        Status::create([
            'name' => 'Hilang',
            'type' => 'asset',
            'description' => 'Aset hilang',
        ]);

        Status::create([
            'name' => 'Perbaikan',
            'type' => 'asset',
            'description' => 'Aset sedang dalam perawatan',
        ]);
    }
}
