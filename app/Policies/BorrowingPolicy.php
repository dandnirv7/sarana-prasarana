<?php

namespace App\Policies;

use App\Models\Borrowing;
use App\Models\User;

class BorrowingPolicy
{
    /**
     * Admin & Manager lihat semua
     * Staff hanya lihat milik sendiri
     */
    public function viewAny(User $user): bool
    {
        return $user->can('approve borrowing')
            || $user->can('borrow asset');
    }

    public function view(User $user, Borrowing $borrowing): bool
    {
        return $user->can('approve borrowing')
            || $borrowing->user_id === $user->id;
    }

    /**
     * Staff mengajukan peminjaman
     * Hanya jika aset tersedia
     */
    public function create(User $user, Asset $asset): bool
    {
        return $user->can('borrow asset')
            && $asset->status === 'Tersedia';
    }

    /**
     * Approve hanya jika status masih Pending
     */
    public function approve(User $user, Borrowing $borrowing): bool
    {
        return $user->can('approve borrowing')
            && $borrowing->status === 'Pending';
    }

    /**
     * Pengembalian hanya oleh peminjam
     * dan belum dikembalikan
     */
    public function return(User $user, Borrowing $borrowing): bool
    {
        return $user->can('return asset')
            && $borrowing->user_id === $user->id
            && $borrowing->status === 'Disetujui';
    }

    /**
     * Tidak boleh delete (audit trail)
     */
    public function delete(): bool
    {
        return false;
    }
}
