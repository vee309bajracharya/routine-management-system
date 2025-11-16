<?php

namespace App\Models;

use App\Models\User;
use App\Models\Routine;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SavedRoutine extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'routine_id',
        'label',
        'description',
        'saved_date',
        'routine_snapshot',
        'created_by',
    ];

    protected $casts = [
        'routine_data' => 'array',
        'saved_date' => 'date',
    ];

    public function routine(): BelongsTo{
        return $this->belongsTo(Routine::class);
    }

    public function creator(): BelongsTo{
        return $this->belongsTo(User::class, 'created_by');
    }
}
