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
        $this->status = strtolower($status);
    }

    public function collection()
    {
        $statusMap = [
            'sesuai' => 'Sesuai',
            'rusak' => ['Rusak', 'Rusak Ringan', 'Rusak Berat', 'Perbaikan', 'Belum Diperbaiki'],
            'hilang' => 'Hilang',
        ];

        $query = Borrowing::with(['user:id,name', 'asset:id,name'])
            ->whereBetween('borrow_date', [$this->startDate, $this->endDate])
            ->when($this->status !== 'all', function ($q) use ($statusMap) {
                $filterValue = $statusMap[$this->status] ?? null;
                if ($filterValue) {
                    if (is_array($filterValue)) {
                        $q->whereIn('condition_status', $filterValue);
                    } else {
                        $q->where('condition_status', $filterValue);
                    }
                }
            });

        return $query->get()->map(function($item) {
            $condition = $item->condition_status;
            if (in_array($condition, ['Rusak', 'Rusak Ringan', 'Rusak Berat', 'Perbaikan', 'Belum Diperbaiki'])) {
                $condition = 'Rusak';
            } elseif ($condition === 'Sesuai') {
                $condition = 'Sesuai';
            } elseif ($condition === 'Hilang') {
                $condition = 'Hilang';
            }

            return [
                'Peminjam' => $item->user->name,
                'Nama Aset' => $item->asset->name,
                'Tgl Pinjam' => $item->borrow_date,
                'Tgl Kembali' => $item->return_date ?? '-',
                'Kondisi' => $item->asset_condition,
                'Status' => $condition,
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
