<?php

namespace App\Exports;

use App\Models\Borrowing;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class BorrowingExport implements FromCollection, WithHeadings
{
    public function collection(): Collection
    {
        return Borrowing::with('user', 'status') 
            ->get() 
            ->map(fn ($borrowing) => [
                'Nama'     => $borrowing->user->name,
                'Aset' => $borrowing->asset->name ?? '-', 
                'Tanggal Peminjaman'  => $borrowing->borrow_date,
                'Tanggal Pengembalian'   => $borrowing->return_date,
                'Status'    => $borrowing->status->name,
            ]);
    }

    public function headings(): array
    {
        return [
            'Nama',
            'Aset',
            'Tanggal Peminjaman',
            'Tanggal Pengembalian',
            'Status',
        ];
    }
}
