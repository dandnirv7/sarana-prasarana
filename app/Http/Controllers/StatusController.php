<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Borrowing;
use App\Models\AssetReturn;

class StatusController extends Controller
{

    public function index()
    {
        return Inertia::render('settings/statuses', [
            'borrowingStatuses' => [
                [
                    'id' => 1,
                    'name' => 'Pending',
                    'color' => 'secondary',
                    'description' => 'Menunggu persetujuan admin',
                ],
                [
                    'id' => 2,
                    'name' => 'Approved',
                    'color' => 'success',
                    'description' => 'Peminjaman telah disetujui',
                ],
                [
                    'id' => 3,
                    'name' => 'Rejected',
                    'color' => 'destructive',
                    'description' => 'Peminjaman ditolak',
                ],
            ],
            'returnStatuses' => [
                [
                    'id' => 1,
                    'name' => 'Waiting',
                    'color' => 'secondary',
                    'description' => 'Menunggu pengembalian aset',
                ],
                [
                    'id' => 2,
                    'name' => 'Completed',
                    'color' => 'success',
                    'description' => 'Aset telah dikembalikan',
                ],
            ],
        ]);
    }

    public function updateBorrowing(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $borrowing = Borrowing::findOrFail($id);
        $borrowing->update($validated);

        return back()->with('success', 'Status borrowing berhasil diperbarui');
    }

    public function updateAssetReturn(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $assetReturn = AssetReturn::findOrFail($id);
        $assetReturn->update($validated);

        return back()->with('success', 'Status return berhasil diperbarui');
    }
}
