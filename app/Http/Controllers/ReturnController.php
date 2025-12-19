<?php

namespace App\Http\Controllers;

use App\Models\AssetReturn;
use App\Models\Borrowing;
use Illuminate\Http\Request;

class ReturnController extends Controller
{
    public function store(Request $request, Borrowing $borrowing)
    {
        AssetReturn::create([
            'borrowing_id' => $borrowing->id,
            'return_date_actual' => now(),
            'asset_condition' => $request->asset_condition,
            'note' => $request->note,
        ]);

        $borrowing->update([
            'actual_return_date' => now(),
            'asset_condition' => $request->asset_condition,
            'status' => 'Dikembalikan',
        ]);

        $borrowing->asset->update([
            'status' => $request->asset_condition === 'Baik'
                ? 'Tersedia'
                : 'Perbaikan',
        ]);

        return redirect()->route('borrowings.index');
    }
}
