<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asset;
use App\Models\Category;
use App\Models\Status;
use Illuminate\Support\Facades\Storage;

class AssetSeeder extends Seeder
{
    public function run(): void
    {
        if (!Storage::disk('public')->exists('assets')) {
            Storage::disk('public')->makeDirectory('assets');
        }

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
            ['Laptop Dell XPS 13', $laptop, 'Baik', $tersedia, 'laptop.png'],
            ['Proyektor EPSON EB-X05', $proyektor, 'Baik', $dipinjam, 'proyektor.png'],
            ['Meja Kerja Kayu', $furniture, 'Baik', $tersedia, 'meja.png'],
            ['Kursi Ergonomis', $furniture, 'Rusak Ringan', $rusak, 'kursi.png'],
            ['Printer HP LaserJet', $printer, 'Rusak', $perbaikan, 'printer.png'],
            ['Whiteboard Magnetic', $whiteboard, 'Baik', $dipinjam, 'whiteboard.png'],
            ['Air Conditioner Panasonic', $ac, 'Baik', $tersedia, 'ac.png'],
            ['Router WiFi TP-Link', $jaringan, 'Baik', $tersedia, 'router.png'],
            ['Monitor LG 27 inch', $monitor, 'Baik', $tersedia, 'monitor.png'],
            ['Keyboard Mekanik', $keyboard, 'Baik', $dipinjam, 'keyboard.png'],
            ['Mouse Wireless', $mouse, 'Baik', $tersedia, 'mouse.png'],
            ['Lemari Penyimpanan', $lemari, 'Baik', $perbaikan, 'lemari.png'],
        ];

        foreach ($assets as [$name, $category, $condition, $status, $filename]) {
            $sourcePath = database_path("seeders/images/{$filename}");
            $targetPath = "assets/{$filename}";


            if (file_exists($sourcePath) && !Storage::disk('public')->exists($targetPath)) {
                Storage::disk('public')->put($targetPath, file_get_contents($sourcePath));
            }


            Asset::create([
                'category_id' => $category->id,
                'name'        => $name,
                'condition'   => $condition,
                'status_id'   => $status->id,
                'image_path'  => $targetPath, 
    
            ]);
        }
    }
}
