<?php

namespace App\Models;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Batch;
use App\Models\Semester;
use App\Models\TimeSlot;
use App\Models\Institution;
use App\Models\RoutineEntry;
use App\Models\SavedRoutine;
use Spatie\Activitylog\LogOptions;
use App\Models\RoutineNotification;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Routine extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'description', 'status', 'effective_from', 'effective_to']) // fields to track
            ->logOnlyDirty() // Only log if something actually changed
            ->dontSubmitEmptyLogs() // Don't save a log if no tracked fields changed
            ->useLogName('routine');
    }

    protected $fillable = [
        'institution_id',
        'semester_id',
        'batch_id',
        'title',
        'description',
        'generated_by',
        'status',
        'published_at',
        'effective_from',
        'effective_to',
        'expiration_notified',
        'expiration_notified_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'expiration_notified' => 'boolean',
        'expiration_notified_at' => 'datetime',
    ];

    // get the institution that owns this routine
    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    // get the semester of this routine
    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    // get the batch of this routine
    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    // get the user who generated this routine
    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    // one routine has many entries
    public function routineEntries()
    {
        return $this->hasMany(RoutineEntry::class);
    }

    // one routine has many notifications
    public function notifications()
    {
        return $this->hasMany(RoutineNotification::class);
    }

    // Routine Versions
    public function savedVersions()
    {
        return $this->hasMany(SavedRoutine::class);
    }

    // === scopes ===

    // filter routines by institution
    public function scopeByInstitution($query, $institutionId)
    {
        return $query->where('institution_id', $institutionId);
    }

    // filter routines by semester
    public function scopeBySemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    // filter routines by batch
    public function scopeByBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }

    // filter 'published' routines
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    // filter 'draft' routines
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    // filter by status
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    // mark routine as published
    public function publish(): bool
    {
        $this->status = 'published';
        $this->published_at = now();
        return $this->save();
    }

    // Check if routine is currently effective
    public function isCurrentlyEffective(): bool
    {
        if (!$this->effective_from || !$this->effective_to) {
            return $this->status === 'published';
        }

        $today = now()->toDateString();
        $effectiveFrom = Carbon::parse($this->effective_from)->toDateString();
        $effectiveTo = Carbon::parse($this->effective_to)->toDateString();
        return $this->status === 'published' &&
            $today >= $effectiveFrom &&
            $today <= $effectiveTo;
    }

    // routine expiringSoon and active scopes
    public function scopeExpiringSoon($query, $days = 10)
    {
        return $query->where('effective_to', '<=', now()->addDays($days))
            ->where('effective_to', '>=', now())
            ->where('expiration_notified', false);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'published')
            ->where('effective_from', '<=', now())
            ->where('effective_to', '>=', now());
    }

    // data prep. logic for pdf to be sent in mail
    public function getPdfData()
    {
        $shift = $this->batch->shift ?? 'Morning';

        $timeSlots = TimeSlot::where('batch_id', $this->batch_id)
            ->where('semester_id', $this->semester_id)
            ->where('shift', $shift)
            ->where('is_active', true)
            ->orderBy('start_time', 'asc')
            ->get();

        $entries = RoutineEntry::with([
            'courseAssignment.course',
            'courseAssignment.teacher.user',
            'room',
            'timeSlot'
        ])
            ->where('routine_id', $this->id)
            ->whereHas('timeSlot', function ($query) use ($shift) {
                $query->where('shift', $shift);
            })
            ->get();

        $grid = [];
        foreach ($entries as $entry) {
            $timeKey = $entry->timeSlot->start_time->format('H:i');
            $grid[$entry->day_of_week][$timeKey] = [
                'course_name' => $entry->courseAssignment?->course?->course_name,
                'teacher_name' => $entry->courseAssignment?->teacher?->user?->name,
                'room_label' => $entry->room?->display_label ?? $entry->room?->name,
                'entry_type' => $entry->entry_type,
            ];
        }

        return [
            'routine' => $this,
            'grid' => $grid,
            'timeSlots' => $timeSlots,
            'status' => $this->status,
            'shift' => $shift,
        ];
    }
}
