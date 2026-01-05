<?php

namespace App\Http\Controllers;

use App\Exports\ReportExport;
use App\Models\Borrowing;
use App\Services\PHPMailerService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\View;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{

    private function filteredBorrowings(array $filters)
    {
        $statusMap = [
            'sesuai' => 'Sesuai',
            'rusak'  => ['Rusak', 'Rusak Ringan', 'Rusak Berat', 'Perbaikan', 'Belum Diperbaiki'],
            'hilang' => 'Hilang',
        ];

        return Borrowing::with([
                'user:id,name',
                'asset:id,name',
                'assetReturn'
            ])
            ->whereBetween('borrow_date', [
                $filters['start_date'],
                $filters['end_date']
            ])
            ->when($filters['status'] !== 'semua', function ($q) use ($filters, $statusMap) {
                $filterValue = $statusMap[$filters['status']] ?? null;

                if ($filterValue) {
                    is_array($filterValue)
                        ? $q->whereIn('condition_status', $filterValue)
                        : $q->where('condition_status', $filterValue);
                }
            })
            ->orderByDesc('borrow_date')
            ->get();
    }


    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => ['nullable', 'date'],
            'end_date'   => ['nullable', 'date', 'after_or_equal:start_date'],
            'status'     => ['nullable', 'string'],
        ], [
            'end_date.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal mulai.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $filters = [
            'start_date' => $request->input('start_date', Carbon::now()->subMonth()->toDateString()),
            'end_date'   => $request->input('end_date', Carbon::now()->toDateString()),
            'status'     => strtolower($request->input('status', 'semua')),
        ];

        $borrowingsQuery = Borrowing::with([
                'user:id,name',
                'asset:id,name',
                'status:id,name',
                'assetReturn'
            ])
            ->whereHas('status', function ($q) {
                $q->where('name', '!=', 'Ditolak');
            })
            ->whereBetween('borrow_date', [$filters['start_date'], $filters['end_date']])
            ->latest();

        if ($filters['status'] !== 'semua') {
            $borrowingsQuery->whereIn(
                'condition_status',
                match ($filters['status']) {
                    'rusak'  => ['Rusak', 'Rusak Ringan', 'Rusak Berat', 'Perbaikan', 'Belum Diperbaiki'],
                    'sesuai' => ['Sesuai'],
                    'hilang' => ['Hilang'],
                    default  => []
                }
            );
        }

        $allBorrowings = $borrowingsQuery->get();

        $stats = [
            'total'  => $allBorrowings->count(),
            'sesuai' => $allBorrowings->where('condition_status', 'Sesuai')->count(),
            'rusak'  => $allBorrowings->whereIn('condition_status', [
                'Rusak', 'Rusak Ringan', 'Rusak Berat', 'Perbaikan', 'Belum Diperbaiki'
            ])->count(),
            'hilang' => $allBorrowings->where('condition_status', 'Hilang')->count(),
        ];

        $borrowings = $borrowingsQuery
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('reports/index', [
            'borrowings' => $borrowings,
            'stats'      => $stats,
            'filters'    => $filters,
            'statusConditions' => ['Sesuai', 'Rusak', 'Hilang'],
        ]);
    }


    public function exportExcel(Request $request)
    {
        $request->validate([
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
            'status'     => ['nullable', 'string'],
        ]);

        return Excel::download(
            new ReportExport(
                $request->start_date,
                $request->end_date,
                strtolower($request->status ?? 'semua')
            ),
            'laporan-aset.xlsx'
        );
    }


    public function exportPdf(Request $request)
    {
        $request->validate([
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
            'status'     => ['nullable', 'string'],
        ]);

        $filters = [
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'status'     => strtolower($request->status ?? 'semua'),
        ];

        $borrowings = $this->filteredBorrowings($filters);

        return Pdf::loadView('pdf.reports', [
            'borrowings' => $borrowings,
            'start_date' => $filters['start_date'],
            'end_date'   => $filters['end_date'],
            'status'     => $filters['status'] !== 'semua'
                ? ucfirst($filters['status'])
                : 'Semua',
        ])->download('laporan-aset.pdf');
    }


    public function exportPdfAndEmail(Request $request)
    {
        $request->validate([
            'email'      => ['required', 'email'],
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
            'status'     => ['nullable', 'string'],
        ], [
            'email.required' => 'email wajib diisi.',
            'email.email'    => 'Alamat email tidak valid.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date'     => 'Tanggal mulai harus berupa tanggal yang valid.',
            'end_date.required'   => 'Tanggal akhir wajib diisi.',
            'end_date.date'       => 'Tanggal akhir harus berupa tanggal yang valid.',
            'end_date.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal mulai.',
        ]);

        $filters = [
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'status'     => strtolower($request->status ?? 'semua'),
        ];

        $borrowings = $this->filteredBorrowings($filters);

        $pdf = Pdf::loadView('pdf.reports', [
            'borrowings' => $borrowings,
            'start_date' => $filters['start_date'],
            'end_date'   => $filters['end_date'],
            'status'     => $filters['status'],
            'exportedAt' => Carbon::now()->translatedFormat('d F Y H:i'),
        ], [
            'email.required' => 'email wajib diisi.',
            'email.email'    => 'Alamat email tidak valid.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date'     => 'Tanggal mulai harus berupa tanggal yang valid.',
            'end_date.required'   => 'Tanggal akhir wajib diisi.',
            'end_date.date'       => 'Tanggal akhir harus berupa tanggal yang valid.',
            'end_date.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal mulai.',
        ]);

        $path = storage_path('app/temp/report.pdf');
        if (!file_exists(dirname($path))) {
            mkdir(dirname($path), 0777, true);
        }

        $pdf->save($path);

        $emailBody = View::make('emails.report', [
            'filters'    => $filters,
            'exportedAt' => Carbon::now()->translatedFormat('d F Y H:i'),
        ])->render();

        PHPMailerService::send(
            $request->email,
            'Laporan Peminjaman Aset',
            $emailBody,
            [$path]
        );

        unlink($path);

        return back()->with('success', 'Laporan PDF berhasil dikirim ke email');
    }


    public function exportExcelAndEmail(Request $request)
    {
        $request->validate([
            'email'      => ['required', 'email'],
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
            'status'     => ['nullable', 'string'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email'    => 'Alamat email tidak valid.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date'     => 'Tanggal mulai harus berupa tanggal yang valid.',
            'end_date.required'   => 'Tanggal akhir wajib diisi.',
            'end_date.date'       => 'Tanggal akhir harus berupa tanggal yang valid.',
            'end_date.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal mulai.',
        ]);

        $filters = [
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'status'     => strtolower($request->status ?? 'semua'),
        ];

        $path = 'temp/report.xlsx';

        Excel::store(
            new ReportExport(
                $filters['start_date'],
                $filters['end_date'],
                $filters['status']
            ),
            $path
        );

        $emailBody = View::make('emails.report', [
            'filters'    => $filters,
            'exportedAt' => Carbon::now()->translatedFormat('d F Y H:i'),
        ])->render();

        PHPMailerService::send(
            $request->email,
            'Laporan Peminjaman Aset',
            $emailBody,
            [storage_path("app/{$path}")]
        );

        unlink(storage_path("app/{$path}"));

        return back()->with('success', 'Laporan Excel berhasil dikirim ke email');
    }
}
