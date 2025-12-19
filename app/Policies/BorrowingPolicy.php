<?php

namespace App\Policies;

use App\Models\Asset;
use App\Models\Borrowing;
use App\Models\User;

class BorrowingPolicy
{
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

    public function create(User $user, Asset $asset): bool
    {
        return $user->can('borrow asset')
            && $asset->status === 'Tersedia';
    }

    public function approve(User $user, Borrowing $borrowing): bool
    {
        return $user->can('approve borrowing')
            && $borrowing->status === 'Pending';
    }

    public function return(User $user, Borrowing $borrowing): bool
    {
        return $user->can('return asset')
            && $borrowing->user_id === $user->id
            && $borrowing->status === 'Disetujui';
    }

    public function delete(): bool
    {
        return false;
    }
}
