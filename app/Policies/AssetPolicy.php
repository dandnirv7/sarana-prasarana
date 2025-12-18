<?php

namespace App\Policies;

use App\Models\Asset;
use App\Models\User;

class AssetPolicy
{
    /**
     * Admin & Manager boleh lihat daftar aset
     */
    public function viewAny(User $user): bool
    {
        return $user->can('manage assets') || $user->can('borrow asset');
    }

    /**
     * Semua role boleh lihat detail aset
     */
    public function view(User $user, Asset $asset): bool
    {
        return true;
    }

    /**
     * Hanya Admin
     */
    public function create(User $user): bool
    {
        return $user->can('manage assets');
    }

    /**
     * Aset hanya boleh diedit jika TIDAK sedang dipinjam
     */
    public function update(User $user, Asset $asset): bool
    {
        return $user->can('manage assets')
            && $asset->status !== 'Dipinjam';
    }

    /**
     * Aset hanya boleh dihapus jika belum pernah dipinjam
     */
    public function delete(User $user, Asset $asset): bool
    {
        return $user->can('manage assets')
            && $asset->borrowings()->count() === 0;
    }
}
