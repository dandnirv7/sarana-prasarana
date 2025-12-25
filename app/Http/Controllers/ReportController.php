<?php

namespace App\Http\Controllers;

use App\Exports\ReportExport;
use App\Models\Borrowing;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input(
            'start_date',
            Carbon::now()->subMonth()->toDateString()
        );

        $endDate = $request->input(
            'end_date',
            Carbon::now()->toDateString()
        );

        $status = $request->input('status', 'all');

        $baseQuery = Borrowing::query()
            ->with(['user:id,name', 'asset:id,name'])
            ->whereBetween('borrow_date', [$startDate, $endDate])
            ->when($status !== 'all', fn ($q) =>
                $q->where('status', $status)
            );

        $borrowings = (clone $baseQuery)
            ->latest()
            ->with(['user:id,name', 'asset:id,name', 'status:id,name'])  
            ->paginate(10)
            ->withQueryString();


        $stats = [
            'total' => (clone $baseQuery)->count(),
            'sesuai' => (clone $baseQuery)->where('asset_condition', 'Sesuai')->count(),
            'rusak'  => (clone $baseQuery)->where('asset_condition', 'Rusak')->count(),
            'hilang' => (clone $baseQuery)->where('asset_condition', 'Hilang')->count(),
        ];

        return Inertia::render('reports/index', [
            'borrowings' => $borrowings,
            'stats' => $stats,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
        ]);
    }

    public function exportExcel(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->subMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());
        $status = $request->input('status', 'all');

        return Excel::download(new ReportExport($startDate, $endDate, $status), 'reports.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->subMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());
        $status = $request->input('status', 'all');

        $borrowings = Borrowing::with(['user:id,name', 'asset:id,name'])
            ->whereBetween('borrow_date', [$startDate, $endDate])
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->get();

        return Pdf::loadView('pdf.reports', compact('borrowings'))
            ->download('data-laporan.pdf');
    }
}
