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
        
        $filters = [
            'search'   => $request->search ? strtolower($request->search) : null,
            'kategori' => $request->kategori ? strtolower($request->kategori) : null,
            'status'   => $request->status ? strtolower($request->status) : null,
        ];

        $assets = Asset::with(['category', 'status'])
            ->when($filters['search'], fn($q) => 
                $q->whereRaw('LOWER(name) like ?', ["%{$filters['search']}%"])
            )
            ->when($filters['kategori'], fn($q, $categoryName) =>
                $q->whereHas('category', fn($q2) => 
                    $q2->whereRaw('LOWER(name) = ?', [$categoryName])
                )
            )
            ->when($filters['status'], fn($q, $statusName) =>
                $q->whereHas('status', fn($q2) => 
                    $q2->whereRaw('LOWER(name) = ?', [$statusName])
                )
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

        return Inertia::render('data-assets/index', [
            'assets' => $assets,
            'filters' => $filters, 
            'categories' => Category::all(['id', 'name']),
            'assetStatuses' => Status::where('type', 'asset')->get(['id', 'name']),
        ]);
    }

    private function adjustAssetStatus(string $statusName): string
    {
        if ($statusName === 'Dikembalikan') return 'Tersedia';
        if ($statusName === 'Perbaikan') return 'Rusak';
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
