<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Borrowing extends Model
{
    protected $dates = ['borrow_date', 'return_date', 'actual_return_date'];

    protected $fillable = [
        'user_id',
        'asset_id',
        'status_id',
        'borrow_date',
        'return_date',
        'actual_return_date',
        'asset_condition',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function assetReturn(): HasOne
    {
        return $this->hasOne(AssetReturn::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class);
    }
}
