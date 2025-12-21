<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Borrowing;
use App\Models\AssetReturn;
use Illuminate\Support\Str;

class AssetReturnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $borrowings = Borrowing::all();

        $conditions = ['Baik', 'Rusak', 'Perbaikan'];

        foreach ($borrowings as $borrowing) {
            $returnDateActual = $borrowing->return_date ?? $borrowing->borrow_date;
            $assetCondition = $conditions[array_rand($conditions)];

            AssetReturn::create([
                'borrowing_id' => $borrowing->id,
                'return_date_actual' => $returnDateActual,
                'asset_condition' => $assetCondition,
                'note' => 'Catatan pengembalian asset',
            ]);

            $borrowing->update([
                'actual_return_date' => $returnDateActual,
                'asset_condition' => $assetCondition,
            ]);
        }
    }
}
