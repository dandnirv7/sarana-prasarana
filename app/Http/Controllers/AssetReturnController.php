<?php

namespace App\Http\Controllers;

use App\Models\AssetReturn;
use App\Models\Borrowing;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReturnsExport;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;

class AssetReturnController extends Controller
{
    public function index(Request $request)
    {
        $query = AssetReturn::with([
            'borrowing.user',
            'borrowing.asset'
        ])->latest();

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->whereHas('borrowing.user', function($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('borrowing.asset', function($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%");
                });
            });
        }

        if ($condition = $request->input('condition')) {
            $query->where('asset_condition', $condition);
        }

        if ($status = $request->input('status')) {
            $query->whereHas('borrowing', function($q) use ($status) {
                $q->where('status', $status);
            });
        }

        $returns = $query->paginate(10)->withQueryString();
        $users = User::select('id', 'name')->get();

        return Inertia::render('returns/index', [
            'returns' => $returns,
            'users' => $users,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
                'condition' => $request->input('condition', ''),
            ],
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
            ],
        ]);
    }

    public function store(Request $request, Borrowing $borrowing)
    {
        $request->validate([
            'asset_condition' => 'required|in:Baik,Rusak,Perbaikan',
            'note' => 'nullable|string',
        ]);

        AssetReturn::create([
            'borrowing_id'       => $borrowing->id,
            'return_date_actual' => now(),
            'asset_condition'    => $request->asset_condition,
            'note'               => $request->note,
        ]);

        $borrowing->update([
            'actual_return_date' => now(),
            'asset_condition'    => $request->asset_condition,
            'status'             => 'Dikembalikan',
        ]);

        $borrowing->asset->update([
            'status' => $request->asset_condition === 'Baik'
                ? 'Tersedia'
                : 'Perbaikan',
        ]);

        return redirect()->route('returns.index')
            ->with('success', 'Aset berhasil dikembalikan');
    }

    public function confirmReturn(Request $request, AssetReturn $assetReturn)
    {
        $messages = [
            'asset_condition.required' => 'Kondisi aset wajib diisi.',
            'asset_condition.in' => 'Kondisi aset tidak valid. Pilih salah satu dari: Baik, Rusak, Perbaikan.',
            'note.string' => 'Catatan harus berupa teks.',
        ];

        $request->validate([
            'asset_condition' => 'required|in:Baik,Rusak,Perbaikan',
            'note' => 'nullable|string',
        ], $messages);

        $assetReturn->update([
            'asset_condition' => $request->asset_condition,
            'note' => $request->note,
        ]);

        $assetReturn->borrowing->update([
            'status' => 'Dikembalikan', 
            'actual_return_date' => now(),
        ]);

        $assetReturn->borrowing->asset->update([
            'status' => $request->asset_condition === 'Baik' ? 'Tersedia' : 'Perbaikan',
        ]);

        return back()->with('success','Aset berhasil dikembalikan');
    }
    
    public function exportExcel()
    {
        return Excel::download(
            new ReturnsExport,
            'data-pengembalian.xlsx'
        );
    }

    public function exportPdf()
    {
        $returns = AssetReturn::with([
            'borrowing.user',
            'borrowing.asset'
        ])->get();

        $pdf = Pdf::loadView('pdf.returns', [
            'returns' => $returns
        ]);

        return $pdf->download('data-pengembalian.pdf');
    }
}
