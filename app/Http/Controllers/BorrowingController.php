<?php

namespace App\Http\Controllers;

use App\Exports\BorrowingExport;
use App\Models\Asset;
use App\Models\Borrowing;
use App\Models\Status;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class BorrowingController extends Controller
{
    private function borrowingStatus(string $name): Status
    {
        return Status::where('type', 'borrowing')
            ->where('name', $name)
            ->firstOrFail();
    }

    private function assetStatus(string $name): Status
    {
        return Status::where('type', 'asset')
            ->where('name', $name)
            ->firstOrFail();
    }

    public function index(Request $request)
    {
        $borrowings = Borrowing::query()
            ->with([
                'user:id,name',
                'asset:id,name,status_id',
                'status:id,name'
            ])
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('asset', fn ($a) =>
                    $a->where('name', 'like', "%{$request->search}%")
                );
            })
            ->when($request->status_name, fn ($q) =>
                $q->where('status_id', $this->borrowingStatus($request->status_name)->id)
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $users = User::select('id', 'name')->get();

        $availableAssetStatus = $this->assetStatus('Tersedia');

        $assets = Asset::where('status_id', $availableAssetStatus->id)
            ->select('id', 'name')
            ->get();

        $borrowingStatuses = Status::where('type', 'borrowing')->get();

        return Inertia::render('borrowings/index', [
            'borrowings' => $borrowings,
            'users' => $users,
            'assets' => $assets,
            'statuses' => $borrowingStatuses,
            'filters' => $request->only('search', 'status_name'),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user()
                    ->getAllPermissions()
                    ->pluck('name')
                    ->toArray(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'asset_id' => 'required|exists:assets,id',
            'borrow_date' => 'required|date',
            'return_date' => 'nullable|date|after_or_equal:borrow_date',
        ]);

        $pendingStatus = $this->borrowingStatus('Menunggu');

        Borrowing::create([
            'user_id' => $validated['user_id'],
            'asset_id' => $validated['asset_id'],
            'borrow_date' => $validated['borrow_date'],
            'return_date' => $validated['return_date'],
            'status_id' => $pendingStatus->id,
        ]);

        return back()->with('success', 'Permintaan peminjaman berhasil dikirim');
    }

    public function update(Request $request, Borrowing $borrowing)
    {
        $validated = $request->validate([
            'status_id' => 'required|exists:statuses,id',
        ]);

        $newStatus = Status::findOrFail($validated['status_id']);

        if ($newStatus->type !== 'borrowing') {
            abort(400, 'Status tidak valid');
        }

        switch ($newStatus->name) {
            case 'Disetujui':
                $borrowing->asset->update([
                    'status_id' => $this->assetStatus('Dipinjam')->id,
                ]);
                break;

            case 'Ditolak':
                $borrowing->asset->update([
                    'status_id' => $this->assetStatus('Tersedia')->id,
                ]);
                break;

            case 'Dikembalikan':
                $borrowing->asset->update([
                    'status_id' => $this->assetStatus('Tersedia')->id,
                ]);

                $borrowing->update([
                    'actual_return_date' => now(),
                ]);
                break;
        }

        $borrowing->update([
            'status_id' => $newStatus->id,
        ]);

        return back()->with('success', 'Status peminjaman berhasil diperbarui');
    }

    public function approve(Borrowing $borrowing)
    {
        $borrowing->update([
            'status_id' => $this->borrowingStatus('Disetujui')->id,
        ]);

        $borrowing->asset->update([
            'status_id' => $this->assetStatus('Dipinjam')->id,
        ]);

        return back()->with('success', 'Peminjaman disetujui');
    }

    public function reject(Borrowing $borrowing)
    {
        $borrowing->update([
            'status_id' => $this->borrowingStatus('Ditolak')->id,
        ]);

        $borrowing->asset->update([
            'status_id' => $this->assetStatus('Tersedia')->id,
        ]);

        return back()->with('success', 'Peminjaman ditolak');
    }

    public function confirmReturn(Borrowing $borrowing)
    {
        $borrowing->update([
            'status_id' => $this->borrowingStatus('Dikembalikan')->id,
            'actual_return_date' => now(),
        ]);

        $borrowing->asset->update([
            'status_id' => $this->assetStatus('Tersedia')->id,
        ]);

        return back()->with('success', 'Aset berhasil dikembalikan');
    }

    public function exportExcel()
    {
        return Excel::download(new BorrowingExport(), 'borrowings.xlsx');
    }

    public function exportPdf()
    {
        $borrowings = Borrowing::with(['user', 'asset', 'status'])->get();

        return Pdf::loadView('pdf.borrowings', compact('borrowings'))
            ->download('data-peminjaman.pdf');
    }
}
