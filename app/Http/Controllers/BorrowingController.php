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
        $filters = [
            'search' => $request->search ? strtolower($request->search) : null,
            'status' => $request->status ? strtolower($request->status) : null,
        ];

        $borrowings = Borrowing::query()
            ->with(['user:id,name','asset:id,name,status_id','status:id,name'])
            ->when($filters['search'], function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->whereHas('asset', fn($a) => $a->whereRaw('LOWER(name) like ?', ["%{$search}%"]))
                          ->orWhereHas('user', fn($u) => $u->whereRaw('LOWER(name) like ?', ["%{$search}%"]));
                });
            })
            ->when($filters['status'], fn($q,$statusName) =>
                $q->whereHas('status', fn($s) => $s->whereRaw('LOWER(name) = ?', [$statusName]))
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $users = User::select('id','name')->get();

        $availableAssetStatus = $this->assetStatus('Tersedia');
        $assets = Asset::where('status_id',$availableAssetStatus->id)->select('id','name')->get();

        $borrowingStatuses = Status::where('type','borrowing')->get();

        return Inertia::render('borrowings/index', [
            'borrowings' => $borrowings,
            'users' => $users,
            'assets' => $assets,
            'statuses' => $borrowingStatuses,
            'filters' => $filters,
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
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
        ], [
            'user_id.required' => 'User wajib dipilih',
            'user_id.exists' => 'User tidak valid',
            'asset_id.required' => 'Aset wajib dipilih',
            'asset_id.exists' => 'Aset tidak valid',
            'borrow_date.required' => 'Tanggal pinjam wajib diisi',
            'borrow_date.date' => 'Tanggal pinjam tidak valid',
            'return_date.date' => 'Tanggal kembali tidak valid',
            'return_date.after_or_equal' => 'Tanggal kembali harus sama atau setelah tanggal pinjam',
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
        ], [
            'status_id.required' => 'Status wajib dipilih',
            'status_id.exists' => 'Status tidak valid',
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

        $borrowing->update(['status_id' => $newStatus->id]);

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
        $borrowings = Borrowing::with(['user','asset','status'])->get();

        return Pdf::loadView('pdf.borrowings', compact('borrowings'))
            ->download('data-peminjaman.pdf');
    }
}
