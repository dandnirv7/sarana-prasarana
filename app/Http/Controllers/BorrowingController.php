<?php

namespace App\Http\Controllers;

use App\Exports\BorrowingExport;
use App\Models\Asset;
use App\Models\Borrowing;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;

class BorrowingController extends Controller
{
    public function index(Request $request)
    {
        $borrowings = Borrowing::query()
            ->with(['user:id,name', 'asset:id,name'])
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('asset', fn ($a) =>
                    $a->where('name', 'like', "%{$request->search}%")
                );
            })
            ->when($request->status, fn ($q) =>
                $q->where('status', $request->status)
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $users = User::select('id', 'name')->get();

        $assets = Asset::where('status', 'Tersedia')
            ->select('id', 'name')
            ->get();

        return Inertia::render('borrowings/index', [
            'borrowings' => $borrowings,
            'users' => $users,
            'assets' => $assets, 
            'filters' => $request->only('search', 'status'),
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
        ]);

        Borrowing::create([
            'user_id' => $validated['user_id'],
            'asset_id' => $validated['asset_id'],
            'borrow_date' => $validated['borrow_date'],
            'return_date' => $validated['return_date'],
            'status' => 'Pending',
        ]);

        return redirect()->back()->with('success', 'Permintaan peminjaman dikirim');
    }


    public function update(Request $request, Borrowing $borrowing)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Disetujui,Ditolak,Dikembalikan',
        ]);

        if ($validated['status'] === 'Disetujui') {
            $borrowing->asset->update(['status' => 'Dipinjam']);
        }

        if ($validated['status'] === 'Ditolak') {
            $borrowing->asset->update(['status' => 'Tersedia']);
        }

        if ($validated['status'] === 'Dikembalikan') {
            $borrowing->asset->update(['status' => 'Tersedia']);
            $borrowing->update([
                'actual_return_date' => now(),
            ]);
        }

        $borrowing->update([
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Status peminjaman diperbarui');
    }

     public function approve(Borrowing $borrowing)
    {
        $borrowing->update([
            'status' => 'Disetujui',
        ]);

        $borrowing->asset->update([
            'status' => 'Dipinjam',
        ]);

        return back()->with('success', 'Peminjaman disetujui');
    }

    public function reject(Borrowing $borrowing)
    {
        $borrowing->update([
            'status' => 'Ditolak',
        ]);

        $borrowing->asset->update([
            'status' => 'Tersedia',
        ]);

        return back()->with('success', 'Peminjaman ditolak');
    }

    public function confirmReturn(Borrowing $borrowing)
    {
        $borrowing->update([
            'status' => 'Dikembalikan',
            'actual_return_date' => now(),
        ]);

        $borrowing->asset->update([
            'status' => 'Tersedia',
        ]);

        return back()->with('success', 'Aset berhasil dikembalikan');
    }

    public function exportExcel()
    {
        return Excel::download(new BorrowingExport(), 'borrowings.xlsx');
    }

    public function exportPdf()
    {
        $borrowings = Borrowing::all();
        return Pdf::loadView('pdf.borrowings', compact('borrowings'))->download('data-peminjaman.pdf');
    }
}
