<?php

namespace App\Exports;

use App\Models\Asset;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AssetsExport implements FromCollection, WithHeadings
{
    public function collection(): Collection
    {
        return Asset::with(['category', 'status']) 
        ->orderBy('name','asc')
            ->get()
            ->map(fn ($asset) => [
                'Nama'     => $asset->name,
                'Kategori' => $asset->category->name ?? '-', 
                'Kondisi'  => $asset->condition,
                'Status'   => $asset->status->name ?? '-',                 
            ]);
    }

    public function headings(): array
    {
        return [
            'Nama',
            'Kategori',
            'Kondisi',
            'Status',
        ];
    }
}
