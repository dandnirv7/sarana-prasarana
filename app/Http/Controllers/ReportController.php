<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReportExport;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    public function index(Request $request)
    {
          $validator = Validator::make($request->all(), [
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'string'],
        ], [
            'end_date.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal mulai.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'end_date.required' => 'Tanggal akhir wajib diisi.',
            'start_date.date' => 'Tanggal mulai tidak valid.',
            'end_date.date' => 'Tanggal akhir tidak valid.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $filters = [
            'start_date' => $request->input('start_date', Carbon::now()->subMonth()->toDateString()),
            'end_date'   => $request->input('end_date', Carbon::now()->toDateString()),
            'status'     => strtolower($request->input('status', 'all')),
        ];

        $statusMap = [
            'sesuai' => 'Sesuai',
            'rusak'  => ['Rusak', 'Rusak Ringan', 'Rusak Berat', 'Perbaikan', 'Belum Diperbaiki'],
            'hilang' => 'Hilang',
        ];

        $borrowingsQuery = Borrowing::with([
                'user:id,name',
                'asset:id,name',
                'assetReturn'
            ])
            ->whereBetween('borrow_date', [$filters['start_date'], $filters['end_date']])
            ->when($filters['status'] !== 'all', function ($q) use ($filters, $statusMap) {
                $filterValue = $statusMap[$filters['status']] ?? null;
                if ($filterValue) {
                    if (is_array($filterValue)) {
                        $q->whereIn('condition_status', $filterValue);
                    } else {
                        $q->where('condition_status', $filterValue);
                    }
                }
            })
            ->latest();

        $allBorrowings = $borrowingsQuery->get();

        $stats = [
            'total'  => $allBorrowings->count(),
            'sesuai' => $allBorrowings->where('condition_status', 'Sesuai')->count(),
            'rusak'  => $allBorrowings->whereIn('condition_status', [
                'Rusak', 'Rusak Ringan', 'Rusak Berat', 'Perbaikan', 'Belum Diperbaiki'
            ])->count(),
            'hilang' => $allBorrowings->where('condition_status', 'Hilang')->count(),
        ];

        $statusConditions = ['Sesuai', 'Rusak', 'Hilang'];

        $borrowings = $borrowingsQuery
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('reports/index', [
            'borrowings'       => $borrowings,
            'stats'            => $stats,
            'filters'          => $filters,
            'statusConditions' => $statusConditions,
        ]);
    }

    public function exportExcel(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'string'],
        ], [
            'end_date.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal mulai.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $filters = [
            'start_date' => $request->input('start_date', Carbon::now()->subMonth()->toDateString()),
            'end_date'   => $request->input('end_date', Carbon::now()->toDateString()),
            'status'     => strtolower($request->input('status', 'all')),
        ];

        return Excel::download(
            new ReportExport($filters['start_date'], $filters['end_date'], $filters['status']),
            'reports.xlsx'
        );
    }

    public function exportPdf(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'string'],
        ], [
            'end_date.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal mulai.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $filters = [
            'start_date' => $request->input('start_date', Carbon::now()->subMonth()->toDateString()),
            'end_date'   => $request->input('end_date', Carbon::now()->toDateString()),
            'status'     => strtolower($request->input('status', 'all')),
        ];

        $statusMap = [
            'sesuai' => 'Sesuai',
            'rusak'  => ['Rusak', 'Rusak Ringan', 'Rusak Berat', 'Perbaikan', 'Belum Diperbaiki'],
            'hilang' => 'Hilang',
        ];

        $borrowings = Borrowing::with([
                'user:id,name',
                'asset:id,name',
                'assetReturn'
            ])
            ->whereBetween('borrow_date', [$filters['start_date'], $filters['end_date']])
            ->when($filters['status'] !== 'all', function ($q) use ($filters, $statusMap) {
                $filterValue = $statusMap[$filters['status']] ?? null;
                if ($filterValue) {
                    if (is_array($filterValue)) {
                        $q->whereIn('condition_status', $filterValue);
                    } else {
                        $q->where('condition_status', $filterValue);
                    }
                }
            })
            ->get();

        return Pdf::loadView('pdf.reports', [
            'borrowings' => $borrowings,
            'start_date' => $filters['start_date'],
            'end_date'   => $filters['end_date'],
            'status'     => $filters['status'] !== 'all' ? $filters['status'] : 'Semua',
        ])->download('data-laporan.pdf');
    }
}
