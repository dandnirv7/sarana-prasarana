<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Borrowing;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $totalAssets = Asset::count();
        $availableAssets = Asset::where('status', 'Tersedia')->count();
        $borrowedAssets = Asset::where('status', 'Dipinjam')->count();

        $lastMonth = now()->subMonth();
        $totalAssetsTrend = Asset::where('created_at', '>=', $lastMonth)->count();
        $availableAssetsTrend = Asset::where('status', 'Tersedia')->where('created_at', '>=', $lastMonth)->count();
        $borrowedAssetsTrend = Asset::where('status', 'Dipinjam')->where('created_at', '>=', $lastMonth)->count();

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

        $categoryData = Category::withCount('assets')
            ->get()
            ->map(fn($category) => [
                'name' => $category->name,
                'value' => $category->assets_count
            ]);

        $assetStatusData = Asset::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn($item) => [$item->status => $item->total]);

        $assetStatusDataLastMonth = Asset::select('status', DB::raw('COUNT(*) as total'))
            ->whereMonth('created_at', $lastMonth->month)
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn($item) => [$item->status => $item->total]);

        $twoMonthsAgo = Carbon::now()->subMonths(2);
        $assetStatusDataTwoMonthsAgo = Asset::select('status', DB::raw('COUNT(*) as total'))
            ->whereMonth('created_at', $twoMonthsAgo->month)
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn($item) => [$item->status => $item->total]);

        $formattedAssetStatusData = [
            [
                'name' => 'Tersedia',
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
                'pendingApprovals' => $user->can('approve borrowing') ? Borrowing::where('status', 'Pending')->count() : null,
                'totalAssetsTrend' => $totalAssetsTrend,
                'availableAssetsTrend' => $availableAssetsTrend,
                'borrowedAssetsTrend' => $borrowedAssetsTrend,
                'totalBorrowingsTrend' => $totalBorrowingsTrend, 
            ],
            'categoryData' => $categoryData,
            'assetStatusData' => $assetStatusData,
            'formattedAssetStatusData' => $formattedAssetStatusData,
            'recentActivities' => $recentActivities, 
        ]);
    }

}
