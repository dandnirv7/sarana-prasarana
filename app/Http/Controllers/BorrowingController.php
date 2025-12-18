<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BorrowingController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Borrowing::class, 'borrowing');
    }

    public function store(Request $request)
    {
        Borrowing::create([
            'user_id' => auth()->id(),
            'asset_id' => $request->asset_id,
            'borrow_date' => now(),
            'status' => 'Pending',
        ]);

        Asset::where('id', $request->asset_id)
            ->update(['status' => 'Dipinjam']);

        return redirect()->route('borrowings.index');
    }
}
