<?php

namespace App\Models;

use App\Models\Institution;
use App\Models\RoutineEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Room extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'room_number', 'room_type'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('room');
    }

    protected $fillable = [
        'institution_id',
        'name',
        'room_number',
        'building',
        'room_type',
        'is_available',
        'status',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    // get the institution that owns the room
    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    // get the routine entries for this room
    public function routineEntries()
    {
        return $this->hasMany(RoutineEntry::class);
    }

    // === Scopes ===

    // filter rooms by institution
    public function scopeByInstitution($query, $institutionId)
    {
        return $query->where('institution_id', $institutionId);
    }

    // filter available rooms
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)->where('status', 'active');
    }

    // filter by room type
    public function scopeType($query, string $type)
    {
        return $query->where('room_type', $type);
    }

    // filter by building
    public function scopeByBuilding($query, string $building)
    {
        return $query->where('building', $building);
    }

    // filter active rooms
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // check if room is booked for a specific time_slot and day
    public function isBookedFor($routineId, $timeSlotId, $dayOfWeek): bool
    {
        return $this->routineEntries()
            ->where('routine_id', $routineId)
            ->where('time_slot_id', $timeSlotId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_cancelled', false)
            ->exists();
    }
}
