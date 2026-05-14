<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'area',
        'centroid_latitude',
        'centroid_longitude',
        'added',
        'edited',
    ];

    protected $casts = [
        'area' => 'array',
        'centroid_latitude' => 'decimal:8',
        'centroid_longitude' => 'decimal:8',
        'added' => 'datetime',
        'edited' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
