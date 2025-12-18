<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Borrowing;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function __invoke()
    {
        $this->authorize('view reports');

        return Inertia::render('Reports/Index', [
            'summary' => [
                'totalAssets' => Asset::count(),
                'borrowedAssets' => Asset::where('status', 'borrowed')->count(),
                'returnedAssets' => Borrowing::where('status', 'returned')->count(),
                'totalBorrowings' => Borrowing::count(),
            ],
            'borrowings' => Borrowing::with(['user', 'asset'])
                ->latest()
                ->take(20)
                ->get(),
        ]);
    }
}
