<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Laptop',
                'description' => 'Perangkat laptop operasional perusahaan',
            ],
            [
                'name' => 'Ruang Meeting',
                'description' => 'Ruangan rapat internal',
            ],
            [
                'name' => 'Kendaraan Dinas',
                'description' => 'Motor dan mobil operasional',
            ],
            [
                'name' => 'Furniture',
                'description' => 'Meja, kursi, dan perlengkapan kantor',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
