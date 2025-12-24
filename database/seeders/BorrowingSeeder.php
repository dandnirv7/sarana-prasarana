<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Borrowing;
use App\Models\Asset;
use App\Models\User;
use App\Models\Status;

class BorrowingSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('Tidak ada user');
            return;
        }

        $menunggu = Status::firstOrCreate([
            'name' => 'Menunggu',
            'type' => 'borrowing',
            'description' => 'Peminjaman sedang menunggu persetujuan',
        ]);

        $disetujui = Status::firstOrCreate([
            'name' => 'Disetujui',
            'type' => 'borrowing',
            'description' => 'Peminjaman telah disetujui',
        ]);

        $ditolak = Status::firstOrCreate([
            'name' => 'Ditolak',
            'type' => 'borrowing',
            'description' => 'Peminjaman ditolak',
        ]);

        $dikembalikan = Status::firstOrCreate([
            'name' => 'Dikembalikan',
            'type' => 'borrowing',
            'description' => 'Peminjaman dikembalikan',
        ]);

        $data = [
            ['Laptop Dell XPS 13', '2025-12-01', '2025-12-05', $menunggu],
            ['Proyektor EPSON EB-X05', '2025-12-02', '2025-12-03', $disetujui],
            ['Printer HP LaserJet', '2025-12-03', '2025-12-10', $dikembalikan],
            ['Whiteboard Magnetic', '2025-12-04', '2025-12-06', $menunggu],
            ['Air Conditioner Panasonic', '2025-12-05', '2025-12-12', $disetujui],
            ['Router WiFi TP-Link', '2025-12-06', '2025-12-08', $menunggu],
            ['Monitor LG 27 inch', '2025-12-07', '2025-12-09', $disetujui],
            ['Keyboard Mekanik', '2025-12-08', '2025-12-11', $menunggu],
            ['Mouse Wireless', '2025-12-09', '2025-12-10', $disetujui],
            ['Meja Kerja Kayu', '2025-12-10', '2025-12-15', $menunggu],
            ['Kursi Ergonomis', '2025-12-11', '2025-12-14', $menunggu],
            ['Lemari Penyimpanan', '2025-12-12', '2025-12-18', $ditolak],
        ];

        foreach ($data as [$assetName, $borrowDate, $returnDate, $status]) {
            $asset = Asset::where('name', $assetName)->first();
            if ($asset) {
                Borrowing::create([
                    'user_id'     => $users->random()->id,
                    'asset_id'    => $asset->id,
                    'asset_condition' => $asset->condition,
                    'borrow_date' => $borrowDate,
                    'return_date' => $returnDate,
                    'status_id'   => $status->id,
                ]);
            }
        }
    }
}
