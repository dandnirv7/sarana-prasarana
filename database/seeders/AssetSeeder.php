<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asset;
use App\Models\Category;

class AssetSeeder extends Seeder
{
    public function run(): void
    {
        $elektronik = Category::firstOrCreate(['name' => 'Elektronik']);
        $furniture  = Category::firstOrCreate(['name' => 'Furniture']);
        $alatTulis  = Category::firstOrCreate(['name' => 'Alat Tulis']);
        $jaringan   = Category::firstOrCreate(['name' => 'Jaringan']);
        $ac         = Category::firstOrCreate(['name' => 'AC/Pendingin']);

        $assets = [
            ['Laptop Dell XPS 13', $elektronik, 'Baik', 'Tersedia', 'assets/laptop.jpg'],
            ['Proyektor EPSON EB-X05', $elektronik, 'Baik', 'Dipinjam', 'assets/proyektor.jpg'],
            ['Meja Kerja Kayu', $furniture, 'Baik', 'Tersedia', 'assets/meja.jpg'],
            ['Kursi Ergonomis', $furniture, 'Rusak Ringan', 'Rusak', 'assets/kursi.jpg'],
            ['Printer HP LaserJet', $elektronik, 'Baik', 'Tersedia', 'assets/printer.jpg'],
            ['Whiteboard Magnetic', $alatTulis, 'Baik', 'Dipinjam', 'assets/whiteboard.jpg'],
            ['Air Conditioner Panasonic', $ac, 'Baik', 'Tersedia', 'assets/ac.jpg'],
            ['Router WiFi TP-Link', $jaringan, 'Baik', 'Tersedia', 'assets/router.jpg'],
            ['Monitor LG 27 inch', $elektronik, 'Baik', 'Tersedia', 'assets/monitor.jpg'],
            ['Keyboard Mekanik', $elektronik, 'Baik', 'Dipinjam', 'assets/keyboard.jpg'],
            ['Mouse Wireless', $elektronik, 'Baik', 'Tersedia', 'assets/mouse.jpg'],
            ['Lemari Penyimpanan', $furniture, 'Baik', 'Tersedia', 'assets/lemari.jpg'],
        ];

        foreach ($assets as [$name, $category, $condition, $status, $image]) {
            Asset::create([
                'category_id' => $category->id,
                'name'        => $name,
                'condition'   => $condition,
                'status'      => $status,
                'image_path'  => $image,
            ]);
        }
    }
}
