<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asset;
use App\Models\Category;
use App\Models\Status;

class AssetSeeder extends Seeder
{
    public function run(): void
    {
        $furniture  = Category::firstOrCreate(['name' => 'Furniture']);
        $jaringan   = Category::firstOrCreate(['name' => 'Jaringan']);
        $ac         = Category::firstOrCreate(['name' => 'AC/Pendingin']);
        $laptop     = Category::firstOrCreate(['name' => 'Laptop']);
        $proyektor  = Category::firstOrCreate(['name' => 'Proyektor']);
        $printer    = Category::firstOrCreate(['name' => 'Printer']);
        $whiteboard = Category::firstOrCreate(['name' => 'Whiteboard']);
        $monitor    = Category::firstOrCreate(['name' => 'Monitor']);
        $keyboard   = Category::firstOrCreate(['name' => 'Keyboard']);
        $mouse      = Category::firstOrCreate(['name' => 'Mouse']);
        $lemari     = Category::firstOrCreate(['name' => 'Lemari']);

        $tersedia   = Status::firstOrCreate(['name' => 'Tersedia', 'type' => 'asset']);
        $dipinjam   = Status::firstOrCreate(['name' => 'Dipinjam', 'type' => 'asset']);
        $rusak      = Status::firstOrCreate(['name' => 'Rusak', 'type' => 'asset']);
        $perbaikan  = Status::firstOrCreate(['name' => 'Perbaikan', 'type' => 'asset']);

        $assets = [
            ['Laptop Dell XPS 13', $laptop, 'Baik', $tersedia, 'assets/laptop.jpg'],
            ['Proyektor EPSON EB-X05', $proyektor, 'Baik', $dipinjam, 'assets/proyektor.jpg'],
            ['Meja Kerja Kayu', $furniture, 'Baik', $tersedia, 'assets/meja.jpg'],
            ['Kursi Ergonomis', $furniture, 'Rusak Ringan', $rusak, 'assets/kursi.jpg'],
            ['Printer HP LaserJet', $printer, 'Rusak', $perbaikan, 'assets/printer.jpg'],
            ['Whiteboard Magnetic', $whiteboard, 'Baik', $dipinjam, 'assets/whiteboard.jpg'],
            ['Air Conditioner Panasonic', $ac, 'Baik', $tersedia, 'assets/ac.jpg'],
            ['Router WiFi TP-Link', $jaringan, 'Baik', $tersedia, 'assets/router.jpg'],
            ['Monitor LG 27 inch', $monitor, 'Baik', $tersedia, 'assets/monitor.jpg'],
            ['Keyboard Mekanik', $keyboard, 'Baik', $dipinjam, 'assets/keyboard.jpg'],
            ['Mouse Wireless', $mouse, 'Baik', $tersedia, 'assets/mouse.jpg'],
            ['Lemari Penyimpanan', $lemari, 'Baik', $perbaikan, 'assets/lemari.jpg'],
        ];

        foreach ($assets as [$name, $category, $condition, $status, $image]) {
            Asset::create([
                'category_id'   => $category->id,
                'name'          => $name,
                'condition' => $condition,
                'status_id'     => $status->id,
                'image_path'    => $image,
            ]);
        }
    }
}
