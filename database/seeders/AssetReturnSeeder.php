<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Borrowing;
use App\Models\AssetReturn;

class AssetReturnSeeder extends Seeder
{
    public function run(): void
    {
        $borrowings = Borrowing::all();
        $conditions = ['Baik', 'Rusak', 'Perbaikan'];

        foreach ($borrowings as $borrowing) {
            $returnDateActual = $borrowing->return_date ?? $borrowing->borrow_date;
            $returnCondition  = $conditions[array_rand($conditions)];

            if ($borrowing->asset_condition === $returnCondition) {
                $conditionStatus = 'Sesuai';
            } else {
                $conditionStatus = $returnCondition;
            }

            AssetReturn::create([
                'borrowing_id'        => $borrowing->id,
                'return_date_actual'  => $returnDateActual,
                'asset_condition'     => $returnCondition,
                'condition_status'    => $conditionStatus,
                'note'                => 'Catatan pengembalian asset',
            ]);

            $borrowing->update([
                'actual_return_date' => $returnDateActual,
                'asset_condition'    => $returnCondition,
                'condition_status'   => $conditionStatus,
            ]);
        }
    }
}
