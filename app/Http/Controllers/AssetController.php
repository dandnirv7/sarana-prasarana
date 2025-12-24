<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Status;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\AssetsExport;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $returnedStatus = Status::where('name', 'Dikembalikan')->first();
        $repairingStatus = Status::where('name', 'Perbaikan')->first();

        $assets = Asset::with(['category', 'status'])
            ->when($request->search, fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
            )
            ->when($request->category_id, fn($q) =>
                $q->where('category_id', $request->category_id)
            )
            ->when($request->status_id, fn($q) =>
                $q->where('status_id', $request->status_id)
            )
            ->paginate(10)
            ->withQueryString()
            ->through(fn($asset) => [
                'id' => $asset->id,
                'name' => $asset->name,
                'category_id' => $asset->category_id,
                'category_name' => $asset->category->name ?? '-',
                'condition' => $asset->condition,
                'status_id' => $asset->status_id,
                'status_name' => $this->adjustAssetStatus($asset->status->name ?? '-'),
                'image' => $asset->image_path ? asset('storage/' . $asset->image_path) : '/placeholder.svg',
            ]);

        return Inertia::render('assets/index', [
            'assets' => $assets,
            'filters' => $request->only('search', 'category_id', 'status_id'),
            'categories' => Category::all(['id', 'name']),
            'assetStatuses' => Status::where('type', 'asset')->get(['id', 'name']),
        ]);
    }

    private function adjustAssetStatus($statusName)
    {
        if ($statusName === 'Dikembalikan') {
            return 'Tersedia';
        }
        if ($statusName === 'Perbaikan') {
            return 'Rusak';
        }
        return $statusName;
    }


    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'condition' => 'required|string|max:255',
            'status_id' => 'required|exists:statuses,id',
            'image_path' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image_path')) {
            $data['image_path'] = $request->file('image_path')->store('assets', 'public');
        }

        Asset::create($data);

        return back()->with('success', 'Aset berhasil ditambahkan');
    }

    public function update(Request $request, Asset $asset)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'condition' => 'required|string|max:255',
            'status_id' => 'required|exists:statuses,id',
            'image_path' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image_path')) {
            $data['image_path'] = $request->file('image_path')->store('assets', 'public');
        }

        $asset->update($data);

        return back()->with('success', 'Aset berhasil diperbarui');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return back()->with('success', 'Aset berhasil dihapus');
    }

    public function exportExcel()
    {
        return Excel::download(new AssetsExport, 'assets.xlsx');
    }

    public function exportPdf()
    {
        $assets = Asset::with(['category', 'status'])->get();
        return Pdf::loadView('pdf.assets', compact('assets'))->download('assets.pdf');
    }
}
