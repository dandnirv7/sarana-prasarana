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
            ['Laptop Dell XPS 13', '2024-12-01', '2024-12-05', 'Pending'],
            ['Proyektor EPSON EB-X05', '2024-12-02', '2024-12-03', 'Disetujui'],
            ['Printer HP LaserJet', '2024-12-03', '2024-12-10', 'Disetujui'],
            ['Whiteboard Magnetic', '2024-12-04', '2024-12-06', 'Pending'],
            ['Air Conditioner Panasonic', '2024-12-05', '2024-12-12', 'Disetujui'],
            ['Router WiFi TP-Link', '2024-12-06', '2024-12-08', 'Pending'],
            ['Monitor LG 27 inch', '2024-12-07', '2024-12-09', 'Disetujui'],
            ['Keyboard Mekanik', '2024-12-08', '2024-12-11', 'Pending'],
            ['Mouse Wireless', '2024-12-09', '2024-12-10', 'Disetujui'],
            ['Meja Kerja Kayu', '2024-12-10', '2024-12-15', 'Pending'],
            ['Kursi Ergonomis', '2024-12-11', '2024-12-14', 'Pending'],
            ['Lemari Penyimpanan', '2024-12-12', '2024-12-18', 'Disetujui'],
            ['Laptop Dell XPS 13', '2024-12-13', '2024-12-17', 'Pending'],
            ['Monitor LG 27 inch', '2024-12-14', '2024-12-20', 'Disetujui'],
            ['Printer HP LaserJet', '2024-12-15', '2024-12-22', 'Pending'],
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
