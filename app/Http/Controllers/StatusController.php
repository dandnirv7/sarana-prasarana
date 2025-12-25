<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Status;

class StatusController extends Controller
{
    public function index()
    {
        return Inertia::render('settings/statuses', [
            'borrowingStatuses' => Status::where('type', 'borrowing')->get(),
            'assetStatuses' => Status::where('type', 'asset')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:borrowing,asset',
            'description' => 'nullable|string',
        ]);

        Status::create($validated);

        return redirect()->route('statuses.index')->with('success', 'Status added successfully!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:borrowing,asset',
            'description' => 'nullable|string',
        ]);

        $status = Status::findOrFail($id);
        $status->update($validated);

        return redirect()->route('statuses.index')->with('success', 'Status updated successfully!');    }

    public function destroy($id)
    {
        $status = Status::findOrFail($id);
        $status->delete();

        return redirect()->route('statuses.index')->with('success', 'Status deleted successfully!');
    }
}
