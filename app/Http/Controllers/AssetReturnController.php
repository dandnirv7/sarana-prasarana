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
use App\Services\PHPMailerService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class AssetReturnController extends Controller
{
    private function getStatusId(string $name, string $type): int
    {
        return Status::where('name', $name)
            ->where('type', $type)
            ->value('id');
    }

    private function pendingReturnCount(): int
    {
        return AssetReturn::whereHas('borrowing.status', function ($query) {
            $query->whereIn('name', ['Disetujui', 'Menunggu Pengembalian']);
        })->count();
    }

    public function index(Request $request)
    {
        $filters = [
            'search' => $request->search ? strtolower($request->search) : null,
            'status' => $request->status ? strtolower($request->status) : null,
        ];

        $user = $request->user();

        $returns = AssetReturn::query()
            ->with(['borrowing.user', 'borrowing.asset', 'borrowing.status'])
            ->when(!$user->can('manage users'), function ($q) use ($user) {
                $q->whereHas('borrowing.user', fn($u) => $u->where('id', $user->id));
            })
            ->when($filters['search'], function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->whereHas('borrowing.user', fn ($u) =>
                        $u->whereRaw('LOWER(name) like ?', ["%{$search}%"])
                    );
                    $query->orWhereHas('borrowing.asset', fn ($a) =>
                        $a->whereRaw('LOWER(name) like ?', ["%{$search}%"])
                    );
                });
            })
            ->when($filters['status'], function ($q, $statusName) {
                if ($statusName === 'menunggu pengembalian') {
                    $q->whereHas('borrowing.status', fn ($s) =>
                        $s->whereIn('name', ['Disetujui'])
                    );
                } else {
                    $q->whereHas('borrowing.status', fn ($s) =>
                        $s->whereRaw('LOWER(name) = ?', [$statusName])
                    );
                }
            })
            ->whereHas('borrowing.status', function ($query) {
                $query->whereIn('name', ['Disetujui', 'Dikembalikan']);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $returns->getCollection()->transform(function ($return) {
            if ($return->borrowing->status->name === 'Disetujui') {
                $return->borrowing->status->name = 'Menunggu Pengembalian';
            }
            return $return;
        });

        $borrowingStatuses = Status::where('type', 'borrowing')
            ->whereIn('name', ['Disetujui', 'Dikembalikan'])
            ->select('id', 'name')
            ->orderBy('id')
            ->get()
            ->map(function ($status) {
                if ($status->name === 'Disetujui') {
                    $status->name = 'Menunggu Pengembalian';
                }
                return $status;
            });

        $users = User::select('id', 'name')->get();

        return Inertia::render('returns/index', [
            'returns' => $returns,
            'users' => $users,
            'borrowingStatuses' => $borrowingStatuses,
            'pendingReturnCount' => $this->pendingReturnCount(),
            'filters' => $filters,
            'auth' => [
                'user' => $user,
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
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
            'status_id' => $this->getStatusId('Disetujui', 'borrowing'),
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

        $user = $assetReturn->borrowing->user;
        $asset = $assetReturn->borrowing->asset;

        $html = view('emails.asset-return-confirmation', [
            'user' => $user,
            'asset' => $asset,
            'condition' => $request->asset_condition,
            'note' => $request->note,
            'returnedAt' => now()->format('d-m-Y H:i'),
        ])->render();

        try {
            PHPMailerService::send(
                $user->email,
                'Konfirmasi Pengembalian Aset',
                $html
            );
        } catch (\Exception $e) {
            Log::error('Gagal kirim email pengembalian: ' . $e->getMessage());
        }

        return back()->with('success', 'Aset berhasil dikembalikan & email telah dikirim');
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
