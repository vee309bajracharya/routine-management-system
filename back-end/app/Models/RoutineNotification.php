<?php

namespace App\Models;

use App\Models\Routine;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoutineNotification extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'routine_id',
        'teacher_id',
        'notification_type',
        'status',
        'error_message',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    // get the routine that owns this notification
    public function routine()
    {
        return $this->belongsTo(Routine::class);
    }

    // get the teacher that receives this notification
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

}
