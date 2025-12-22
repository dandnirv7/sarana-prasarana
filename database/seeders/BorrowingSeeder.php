<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Borrowing;
use App\Models\Asset;
use App\Models\User;

class BorrowingSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('Tidak ada user');
            return;
        }

        $data = [
            ['Laptop Dell XPS 13', '2025-12-01', '2025-12-05', 'Pending'],
            ['Proyektor EPSON EB-X05', '2025-12-02', '2025-12-03', 'Disetujui'],
            ['Printer HP LaserJet', '2025-12-03', '2025-12-10', 'Disetujui'],
            ['Whiteboard Magnetic', '2025-12-04', '2025-12-06', 'Pending'],
            ['Air Conditioner Panasonic', '2025-12-05', '2025-12-12', 'Disetujui'],
            ['Router WiFi TP-Link', '2025-12-06', '2025-12-08', 'Pending'],
            ['Monitor LG 27 inch', '2025-12-07', '2025-12-09', 'Disetujui'],
            ['Keyboard Mekanik', '2025-12-08', '2025-12-11', 'Pending'],
            ['Mouse Wireless', '2025-12-09', '2025-12-10', 'Disetujui'],
            ['Meja Kerja Kayu', '2025-12-10', '2025-12-15', 'Pending'],
            ['Kursi Ergonomis', '2025-12-11', '2025-12-14', 'Pending'],
            ['Lemari Penyimpanan', '2025-12-12', '2025-12-18', 'Disetujui'],
            ['Laptop Dell XPS 13', '2025-12-13', '2025-12-17', 'Pending'],
            ['Monitor LG 27 inch', '2025-12-14', '2025-12-20', 'Disetujui'],
            ['Printer HP LaserJet', '2025-12-15', '2025-12-22', 'Pending'],
        ];

        foreach ($data as [$assetName, $borrowDate, $returnDate, $status]) {
            $asset = Asset::where('name', $assetName)->first();

            if (!$asset) {
                continue;
            }

            Borrowing::create([
                'user_id'     => $users->random()->id, 
                'asset_id'    => $asset->id,
                'borrow_date' => $borrowDate,
                'return_date' => $returnDate,
                'status'      => $status,
            ]);
        }
    }

}
