<?php

namespace App\Exports;

use App\Models\AssetReturn;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ReturnsExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return AssetReturn::with(['borrowing.user', 'borrowing.asset'])
            ->get()
            ->map(function ($item) {
                return [
                    'user'           => $item->borrowing->user->name,
                    'asset'          => $item->borrowing->asset->name,
                    'return_date'    => $item->return_date_actual,
                    'condition'      => $item->asset_condition,
                    'note'           => $item->note,
                ];
            });
    }

    public function headings(): array
    {
        return [
            'Peminjam',
            'Aset',
            'Tanggal Pengembalian',
            'Kondisi',
            'Catatan',
        ];
    }
}
