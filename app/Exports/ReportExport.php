<?php

namespace App\Exports;

use App\Models\Borrowing;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Carbon\Carbon;

class ReportExport implements FromCollection, WithHeadings
{
    protected string $startDate;
    protected string $endDate;
    protected string $status;

    public function __construct(string $startDate, string $endDate, string $status = 'semua')
    {
        $this->startDate = $startDate;
        $this->endDate   = $endDate;
        $this->status    = strtolower($status);
    }

    public function collection(): Collection
    {
        $statusMap = [
            'sesuai' => 'Sesuai',
            'rusak'  => ['Rusak', 'Rusak Ringan', 'Rusak Berat', 'Perbaikan', 'Belum Diperbaiki'],
            'hilang' => 'Hilang',
        ];

        $borrowings = Borrowing::with(['user:id,name', 'asset:id,name'])
            ->whereBetween('borrow_date', [$this->startDate, $this->endDate])
            ->when($this->status !== 'semua', function ($q) use ($statusMap) {
                $filterValue = $statusMap[$this->status] ?? null;

                if ($filterValue) {
                    is_array($filterValue)
                        ? $q->whereIn('condition_status', $filterValue)
                        : $q->where('condition_status', $filterValue);
                }
            })
            ->orderByDesc('borrow_date')
            ->get();

        return $borrowings->values()->map(function ($item, $index) {
            return [
                'No'               => $index + 1,
                'Peminjam'         => $item->user->name,
                'Nama Aset'        => $item->asset->name ?? '-',
                'Tanggal Pinjam'   => Carbon::parse($item->borrow_date)
                                            ->translatedFormat('d F Y'),
                'Tanggal Kembali'  => $item->return_date
                                            ? Carbon::parse($item->return_date)
                                                ->translatedFormat('d F Y')
                                            : '-',
                'Kondisi Aset'     => $item->condition_status,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No',
            'Peminjam',
            'Nama Aset',
            'Tanggal Pinjam',
            'Tanggal Kembali',
            'Kondisi Aset',
        ];
    }
}
