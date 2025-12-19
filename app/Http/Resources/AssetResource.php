<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id'       => $this->id,
            'nama'     => $this->name,
            'kategori' => $this->category->name,
            'kondisi'  => $this->condition,
            'status'   => $this->status,
            'image'    => $this->image_path
                ? asset('storage/' . $this->image_path)
                : null,
        ];
    }
}
