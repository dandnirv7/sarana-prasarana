<?php

namespace App\Http\Controllers;

use App\Exports\BorrowingExport;
use App\Models\Asset;
use App\Models\Borrowing;
use App\Models\Status;
use App\Models\User;
use App\Services\PHPMailerService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class BorrowingController extends Controller
{
    private function borrowingStatus(string $name): Status
    {
        return Status::where('type', 'borrowing')->where('name', $name)->firstOrFail();
    }

    private function assetStatus(string $name): Status
    {
        return Status::where('type', 'asset')->where('name', $name)->firstOrFail();
    }

    public function index(Request $request)
    {
        $filters = [
            'search' => $request->search ? strtolower($request->search) : null,
            'status' => $request->status ? strtolower($request->status) : null,
        ];

        $borrowings = Borrowing::with(['user', 'asset', 'status'])
            ->when($filters['search'], function ($q, $search) {
                $q->whereHas('user', fn ($u) => $u->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]))
                  ->orWhereHas('asset', fn ($a) => $a->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]));
            })
            ->when($filters['status'], function ($q, $status) {
                $q->whereHas('status', fn ($s) => $s->whereRaw('LOWER(name) = ?', [$status]));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $users = User::select('id', 'name')->get();
        $assets = Asset::where('status_id', $this->assetStatus('Tersedia')->id)
            ->select('id', 'name')->get();
        $statuses = Status::where('type', 'borrowing')->get();

        return Inertia::render('borrowings/index', [
            'borrowings' => $borrowings,
            'users' => $users,
            'assets' => $assets,
            'statuses' => $statuses,
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
        ]);

        Borrowing::create([
            'user_id' => $validated['user_id'],
            'asset_id' => $validated['asset_id'],
            'borrow_date' => $validated['borrow_date'],
            'return_date' => $validated['return_date'],
            'status_id' => $this->borrowingStatus('Menunggu')->id,
        ]);

        return back()->with('success', 'Permintaan peminjaman dikirim');
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

        return back()->with('success', 'Pengembalian dikonfirmasi');
    }

    private function filteredBorrowings(array $filters)
    {
        return Borrowing::with(['user', 'asset', 'status'])
            ->when(!empty($filters['search']), function ($q) use ($filters) {
                $search = strtolower($filters['search']);
                $q->where(function ($query) use ($search) {
                    $query->whereHas('user', fn ($u) =>
                        $u->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    )->orWhereHas('asset', fn ($a) =>
                        $a->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    );
                });
            })
            ->when(!empty($filters['status']) && strtolower($filters['status']) !== 'semua', function ($q) use ($filters) {
                $status = strtolower($filters['status']);
                $q->whereHas('status', fn ($s) => $s->whereRaw('LOWER(name) = ?', [$status]));
            })
            ->orderBy('borrow_date', 'desc')
            ->get();
    }

    public function exportPdfAndEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $filters = [
            'search' => $request->search,
            'status' => $request->status,
        ];

        $borrowings = $this->filteredBorrowings($filters);

        $pdf = Pdf::loadView('pdf.borrowings', [
            'borrowings' => $borrowings,
            'filters' => $filters,
            'exportedAt' => Carbon::now()->translatedFormat('d F Y H:i'),
        ]);

        $path = storage_path('app/temp/borrowings.pdf');
        if (!file_exists(dirname($path))) mkdir(dirname($path), 0777, true);
        $pdf->save($path);

        $emailBody = View::make('emails.borrowing-report', [
            'filters' => $filters,
            'exportedAt' => Carbon::now()->translatedFormat('d F Y H:i'),
        ])->render();

        PHPMailerService::send(
            $request->email,
            'Laporan Peminjaman Aset',
            $emailBody,
            [$path]
        );

        unlink($path);

        return back()->with('success', 'Laporan PDF berhasil dikirim');
    }

    public function exportExcelAndEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $filters = [
            'search' => $request->search,
            'status' => $request->status,
        ];

        $path = 'temp/borrowings.xlsx';
        Excel::store(new BorrowingExport($filters), $path);

        $emailBody = View::make('emails.borrowing-report', [
            'filters' => $filters,
            'exportedAt' => Carbon::now()->translatedFormat('d F Y H:i'),
        ])->render();

        PHPMailerService::send(
            $request->email,
            'Laporan Peminjaman Aset',
            $emailBody,
            [storage_path("app/{$path}")]
        );

        unlink(storage_path("app/{$path}"));

        return back()->with('success', 'Laporan Excel berhasil dikirim');
    }
}
