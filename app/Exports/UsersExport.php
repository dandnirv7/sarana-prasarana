<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class UsersExport implements FromCollection, WithHeadings
{
    public function collection(): Collection
    {
        return User::with('roles')->get()->map(fn ($u) => [
            'Nama'       => $u->name,
            'Email'      => $u->email,
            'Role'       => $u->roles->first()?->name,
            'Status'     => $u->email_verified_at ? 'Aktif' : 'Tidak Aktif',
            'Department' => $u->department?->value,
        ]);
    }

    public function headings(): array
    {
        return [
            'Nama',
            'Email',
            'Role',
            'Status',
            'Departemen',
        ];
    }
}
