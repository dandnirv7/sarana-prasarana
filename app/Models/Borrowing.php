<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Borrowing extends Model
{
    protected $dates = ['borrow_date', 'return_date', 'actual_return_date'];

    protected $fillable = [
        'user_id',
        'asset_id',
        'borrow_date',
        'return_date',
        'actual_return_date',
        'asset_condition',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function assetReturn()
    {
        return $this->hasOne(AssetReturn::class);
    }
}
