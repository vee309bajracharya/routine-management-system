<?php

namespace App\Models;

use App\Models\User;
use App\Models\Routine;
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
        return $this->belongsTo(User::class, 'teacher_id');
    }

    // === scopes ===

    // filter notifications by routine
    public function scopeByRoutine($query, $routineId)
    {
        return $query->where('routine_id', $routineId);
    }

    // filter notifications by teacher
    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    // filter by status
    public function scopeStatus($query, string $status){
        return $query->where('status', $status);
    }

    // filter sent notifications
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    // filter pending notifications
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // filter failed notifications
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    // mark notification as sent
    public function markAsSent(): bool{
        $this->status = 'sent';
        $this->sent_at = now();
        $this->error_message = null;
        return $this->save();
    }

    // mark notification as read
    public function markAsRead(): bool{
        $this->status = 'read';
        return $this->save();
    }

    // mark notification as failed
    public function markAsFailed(string $errorMessage): bool{
        $this->status = 'failed';
        $this->error_message = $errorMessage;
        return $this->save();
    }

}
