<?php

namespace App\Exports;

use App\Models\Borrowing;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Carbon\Carbon;

class BorrowingExport implements FromCollection, WithHeadings
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection(): Collection
    {
        $borrowings = Borrowing::with(['user', 'asset', 'status'])
            ->when(!empty($this->filters['search']), function ($q) {
                $search = strtolower($this->filters['search']);
                $q->where(function ($query) use ($search) {
                    $query->whereHas('user', fn ($u) =>
                        $u->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    )->orWhereHas('asset', fn ($a) =>
                        $a->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    );
                });
            })
            ->when(!empty($this->filters['status']) && strtolower($this->filters['status']) !== 'semua', function ($q) {
                $status = strtolower($this->filters['status']);
                $q->whereHas('status', fn ($s) => $s->whereRaw('LOWER(name) = ?', [$status]));
            })
            ->orderBy('borrow_date', 'desc')
            ->get();

    return $borrowings->values()->map(function ($b, $index) {
        return [
            'No' => $index + 1,
            'Nama' => $b->user->name,
            'Aset' => $b->asset->name ?? '-',
            'Tanggal Peminjaman' => Carbon::parse($b->borrow_date)
                ->translatedFormat('d F Y'),
            'Tanggal Pengembalian' => $b->return_date
                ? Carbon::parse($b->return_date)->translatedFormat('d F Y')
                : '-',
            'Status' => $b->status->name,
        ];
    });

    }

    public function headings(): array
    {
        return [
            'No',
            'Nama',
            'Aset',
            'Tanggal Peminjaman',
            'Tanggal Pengembalian',
            'Status',
        ];
    }
}
