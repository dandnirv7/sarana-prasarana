<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Borrowing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'totalAssets' => $user->can('manage assets')
                    ? Asset::count()
                    : null,

                'availableAssets' => $user->can('manage assets')
                    ? Asset::where('status', 'available')->count()
                    : null,

                'borrowedAssets' => $user->can('manage assets')
                    ? Asset::where('status', 'borrowed')->count()
                    : null,

                'myBorrowings' => $user->can('borrow asset')
                    ? Borrowing::where('user_id', $user->id)->count()
                    : null,

                'pendingApprovals' => $user->can('approve borrowing')
                    ? Borrowing::where('status', 'pending')->count()
                    : null,
            ],
        ]);
    }
}
