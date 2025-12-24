<?php

namespace App\Http\Controllers;

use App\Models\AssetReturn;
use App\Models\Borrowing;
use App\Models\Status;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReturnsExport;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;

class AssetReturnController extends Controller
{
    private function getStatusId(string $name, string $type): int
    {
        return Status::where('name', $name)
            ->where('type', $type)
            ->value('id');
    }



    public function index(Request $request)
    {
        $query = AssetReturn::with([
            'borrowing.user',
            'borrowing.asset',
            'borrowing.status'
        ])
        ->whereHas('borrowing.status', function ($q) {
            $q->whereIn('name', ['Disetujui', 'Dikembalikan']);
        })
        ->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('borrowing.user', fn ($q2) =>
                    $q2->where('name', 'like', "%{$search}%")
                )->orWhereHas('borrowing.asset', fn ($q2) =>
                    $q2->where('name', 'like', "%{$search}%")
                );
            });
        }

        if ($condition = $request->input('condition')) {
            $query->where('asset_condition', $condition);
        }

        if ($statusId = $request->input('status')) {
            $query->whereHas('borrowing', fn ($q) =>
                $q->where('status_id', $statusId)
            );
        }

        $borrowingStatuses = Status::where('type', 'borrowing')
            ->select('id', 'name')
            ->orderBy('id')
            ->get();

        return Inertia::render('returns/index', [
            'returns' => $query->paginate(10)->withQueryString(),
            'users' => User::select('id', 'name')->get(),
            'borrowingStatuses' => $borrowingStatuses,
            'filters' => $request->only(['search', 'status', 'condition']),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user()
                    ->getAllPermissions()
                    ->pluck('name'),
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
            'borrowing_id' => $borrowing->id,
            'return_date_actual' => now(),
            'asset_condition' => $request->asset_condition,
            'note' => $request->note,
        ]);

        $borrowing->update([
            'status_id' => $this->getStatusId('Dikembalikan', 'borrowing'),
            'actual_return_date' => now(),
        ]);

        $borrowing->asset->update([
            'status_id' => $request->asset_condition === 'Baik'
                ? $this->getStatusId('Tersedia', 'asset')
                : $this->getStatusId('Perbaikan', 'asset'),
        ]);

        return redirect()
            ->route('returns.index')
            ->with('success', 'Aset berhasil dikembalikan');
    }

    public function confirmReturn(Request $request, AssetReturn $assetReturn)
    {
        $request->validate([
            'asset_condition' => 'required|in:Baik,Rusak,Perbaikan',
            'note' => 'nullable|string',
        ]);

        $assetReturn->update([
            'asset_condition' => $request->asset_condition,
            'note' => $request->note,
        ]);

        $assetReturn->borrowing->update([
            'status_id' => $this->getStatusId('Dikembalikan', 'borrowing'),
            'actual_return_date' => now(),
        ]);

        $assetReturn->borrowing->asset->update([
            'status_id' => $request->asset_condition === 'Baik'
                ? $this->getStatusId('Tersedia', 'asset')
                : $this->getStatusId('Perbaikan', 'asset'),
        ]);

        return back()->with('success', 'Aset berhasil dikembalikan');
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
            'borrowing.asset',
            'borrowing.status'
        ])->get();

        return Pdf::loadView('pdf.returns', compact('returns'))
            ->download('data-pengembalian.pdf');
    }
}
