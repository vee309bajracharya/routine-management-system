<?php

namespace App\Models;

use App\Models\User;
use App\Models\Routine;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class SavedRoutine extends Model
{
    use HasFactory, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['label', 'description'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('savedRoutine');
    }

    protected $fillable = [
        'routine_id',
        'label',
        'description',
        'saved_date',
        'routine_snapshot',
        'created_by',
    ];

    protected $casts = [
        'routine_snapshot' => 'array',
        'saved_date' => 'date',
    ];

    public function routine(): BelongsTo
    {
        return $this->belongsTo(Routine::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
