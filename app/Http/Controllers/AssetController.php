<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\AssetsExport;
use App\Models\Category;

class AssetController extends Controller
{
    
    public function index(Request $request)
    {
$assets = Asset::with('category')
    ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
    ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
    ->when($request->status, fn($q) => $q->where('status', $request->status))
    ->paginate(10)
    ->withQueryString()
    ->through(fn($asset) => [
        'id' => $asset->id,
        'name' => $asset->name,
        'category_id' => $asset->category_id,
        'category_name' => $asset->category->name ?? '-',
        'condition' => $asset->condition,
        'status' => $asset->status,
        'image_path' => $asset->image_path,
    ]);



        $categories = Category::all(['id', 'name']);
        
        return Inertia::render('assets/index', [
            'assets' => $assets,
            'filters' => $request->only('search', 'category_id', 'status'),
            'categories' => $categories,
            'conditions' => ['Tersedia', 'Dipinjam', 'Rusak'],
        ]);
    }


    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|string|max:255',
            'condition' => 'required|string|max:255',
            'status' => 'required|in:Tersedia,Dipinjam,Rusak',
            'image_path' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image_path')) {
            $data['image_path'] = $request->file('image_path')->store('assets', 'public');
        }

        Asset::create($data);

        return redirect()->back()->with('success', 'Aset berhasil ditambahkan');
    }

    public function update(Request $request, Asset $asset)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|string|max:255',
            'condition' => 'required|string|max:255',
            'status' => 'required|in:Tersedia,Dipinjam,Rusak',
            'image_path' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image_path')) {
            $data['image_path'] = $request->file('image_path')->store('assets', 'public');
        }

        $asset->update($data);

        return redirect()->back()->with('success', 'Aset berhasil diperbarui');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return redirect()->back()->with('success', 'Aset berhasil dihapus');
    }

    public function exportExcel()
    {
        return Excel::download(new AssetsExport, 'assets.xlsx');
    }

    public function exportPdf()
    {
        $assets = Asset::all();
        return Pdf::loadView('pdf.assets', compact('assets'))->download('assets.pdf');
    }
}
