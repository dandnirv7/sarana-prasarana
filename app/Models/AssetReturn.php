<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetReturn extends Model
{
    protected $table = 'returns';

    protected $fillable = [
        'borrowing_id',
        'return_date_actual',
        'asset_condition',
        'note',
    ];

    public function borrowing()
    {
        return $this->belongsTo(Borrowing::class);
    }
}
