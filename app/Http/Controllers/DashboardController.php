<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Borrowing;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Status;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $availableStatus = Status::where('type', 'asset')->where('name', 'Tersedia')->first();
        $borrowedStatus = Status::where('type', 'asset')->where('name', 'Dipinjam')->first();
        $pendingStatus = Status::where('type', 'borrowing')->where('name', 'Menunggu')->first();
        $returnedStatus = Status::where('type', 'asset')->where('name', 'Dikembalikan')->first();
        $repairingStatus = Status::where('type', 'asset')->where('name', 'Perbaikan')->first();

        $totalAssets = Asset::count();
        $availableAssets = Asset::where('status_id', $availableStatus->id)->count();
        $borrowedAssets = Asset::where('status_id', $borrowedStatus->id)->count();
        $repairedAssets = Asset::where('status_id', $repairingStatus->id)->count();  
        $returnedAssets = Asset::where('status_id', $returnedStatus->id)->count();  
        
        $lastMonth = now()->subMonth();
        $totalAssetsTrend = Asset::where('created_at', '>=', $lastMonth)->count();
        $availableAssetsTrend = Asset::where('status_id', $availableStatus->id)
            ->where('created_at', '>=', $lastMonth)
            ->count();
        $borrowedAssetsTrend = Asset::where('status_id', $borrowedStatus->id)
            ->where('created_at', '>=', $lastMonth)
            ->count();

        $totalBorrowingsTrend = Borrowing::where('borrow_date', '>=', $lastMonth)->count(); 

        $recentActivities = Borrowing::with('asset', 'user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($borrowing) => [
                'asset_name' => $borrowing->asset->name,
                'user_name' => $borrowing->user->name,
                'borrowing_id' => $borrowing->id,
                'borrowed_at' => Carbon::parse($borrowing->borrow_date)->format('d M Y, H:i'),
            ]);

        $assetStatusData = [
            'Tersedia' => $availableAssets + $returnedAssets, 
            'Dipinjam' => $borrowedAssets,
            'Rusak' => $repairedAssets, 
        ];

        $assetStatusDataLastMonth = Asset::select('status_id', DB::raw('COUNT(*) as total'))
            ->whereMonth('created_at', $lastMonth->month)
            ->groupBy('status_id')
            ->get()
            ->mapWithKeys(fn($item) => [
                $item->status->name ?? 'Unknown' => $item->total
            ]);

        $twoMonthsAgo = now()->subMonths(2);
        $assetStatusDataTwoMonthsAgo = Asset::select('status_id', DB::raw('COUNT(*) as total'))
            ->whereMonth('created_at', $twoMonthsAgo->month)
            ->groupBy('status_id')
            ->get()
            ->mapWithKeys(fn($item) => [
                $item->status->name ?? 'Unknown' => $item->total
            ]);

        $formattedAssetStatusData = [
            [
                'name' => 'Saat ini',
                'available' => $assetStatusData['Tersedia'] ?? 0,
                'borrowed' => $assetStatusData['Dipinjam'] ?? 0,
            ],
            [
                'name' => 'Bulan Lalu',
                'available' => $assetStatusDataLastMonth['Tersedia'] ?? 0,
                'borrowed' => $assetStatusDataLastMonth['Dipinjam'] ?? 0,
            ],
            [
                'name' => '2 Bln Lalu',
                'available' => $assetStatusDataTwoMonthsAgo['Tersedia'] ?? 0,
                'borrowed' => $assetStatusDataTwoMonthsAgo['Dipinjam'] ?? 0,
            ],
        ];

        return Inertia::render('dashboard/index', [
            'stats' => [
                'totalAssets' => $totalAssets,
                'availableAssets' => $availableAssets,
                'borrowedAssets' => $borrowedAssets,
                'myBorrowings' => $user->can('borrow asset') ? Borrowing::where('user_id', $user->id)->count() : null,
                'pendingApprovals' => $user->can('approve borrowing') ? Borrowing::where('status_id', $pendingStatus->id)->count() : null,
                'totalAssetsTrend' => $totalAssetsTrend,
                'availableAssetsTrend' => $availableAssetsTrend,
                'borrowedAssetsTrend' => $borrowedAssetsTrend,
                'totalBorrowingsTrend' => $totalBorrowingsTrend,
            ],
            'categoryData' => Category::withCount('assets')
                ->get()
                ->map(fn($category) => [
                    'name' => $category->name,
                    'value' => $category->assets_count,
                ]),
            'assetStatusData' => $assetStatusData,
            'formattedAssetStatusData' => $formattedAssetStatusData,
            'recentActivities' => $recentActivities,
        ]);
    }

}
