<?php

namespace App\Exports;

use App\Models\Borrowing;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ReportExport implements FromCollection, WithHeadings
{
    protected $startDate;
    protected $endDate;
    protected $status;

    public function __construct(string $startDate, string $endDate, string $status = 'all')
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->status = $status;
    }
    
    public function collection()
    {
        $query = Borrowing::with(['user:id,name', 'asset:id,name'])
            ->whereBetween('borrow_date', [$this->startDate, $this->endDate])
            ->when($this->status !== 'all', fn($q) => $q->where('status', $this->status));

        return $query->get()->map(function($item) {
            return [
                'Peminjam' => $item->user->name,
                'Nama Aset' => $item->asset->name,
                'Tgl Pinjam' => $item->borrow_date,
                'Tgl Kembali' => $item->return_date ?? '-',
                'Kondisi' => $item->asset_condition,
                'Status' => $item->status,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Peminjam',
            'Nama Aset',
            'Tgl Pinjam',
            'Tgl Kembali',
            'Kondisi',
            'Status',
        ];
    }
}
