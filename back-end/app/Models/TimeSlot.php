<?php

namespace App\Models;

use Carbon\Carbon;
use App\Models\Batch;
use App\Models\Routine;
use App\Models\Semester;
use App\Models\Department;
use App\Models\Institution;
use App\Models\RoutineEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TimeSlot extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'institution_id',
        'department_id',
        'batch_id',
        'semester_id',
        'name',
        'start_time',
        'end_time',
        'duration_minutes',
        'slot_type',
        'shift',
        'slot_order',
        'applicable_days',
        'is_active',
    ];

    protected $casts = [
        'applicable_days' => 'array',
        'is_active' => 'boolean',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    // get the institution that owns this time_slot
    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    // get all routine entries for this time_slot
    public function routineEntries()
    {
        return $this->hasMany(RoutineEntry::class);
    }

    //time_slot belongs to department
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function routines()
    {
        return $this->hasMany(Routine::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    // check if time_slot is applicable for specific day
    public function isApplicableForDay(string $dayOfWeek): bool
    {
        if (empty($this->applicable_days)) {
            return true; //if not day not specified, applicable for all days
        }
        return in_array($dayOfWeek, $this->applicable_days);
    }

    // get time format range
    public function getTimeRangeAttribute(): string
    {
        $start = Carbon::parse($this->start_time)->format('H:i');
        $end = Carbon::parse($this->end_time)->format('H:i');
        return "{$start}-{$end}";
    }

    // === scopes ====

    // filter time_slots by institution
    public function scopeByInstitution($query, $institutionId)
    {
        return $query->where('institution_id', $institutionId);
    }

    // filter active time_slots
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // filter by slot_type
    public function scopeType($query, string $type)
    {
        return $query->where('slot_type', $type);
    }

    // filter lecture slot_type only (excluding break)
    public function scopeLectureSlots($query)
    {
        return $query->where('slot_type', 'Lecture');
    }

    // filter slot_order
    public function scopeOrdered($query)
    {
        return $query->where('slot_order', 'asc');
    }

    // to check if time_slot is break
    public function isBreak(): bool
    {
        return $this->slot_type === 'Break';
    }
}
