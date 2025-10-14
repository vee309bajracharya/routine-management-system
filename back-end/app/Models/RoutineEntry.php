<?php

namespace App\Models;

use App\Models\Room;
use App\Models\Routine;
use App\Models\TimeSlot;
use App\Models\CourseAssignment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoutineEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'routine_id',
        'course_assignment_id',
        'room_id',
        'time_slot_id',
        'day_of_week',
        'entry_type',
        'is_cancelled',
        'cancellation_reason',
        'notes',
    ];

    protected $casts = [
        'is_cancelled' => 'boolean',
    ];

    // get the routine for this entry
    public function routine()
    {
        return $this->belongsTo(Routine::class);
    }

    // get the course assigned for this entry
    public function courseAssignment()
    {
        return $this->belongsTo(CourseAssignment::class);
    }

    // get the room for this entry
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    // get the time_slot for this entry
    public function timeSlot()
    {
        return $this->belongsTo(TimeSlot::class);
    }

    // ====scopes====

    // filter entries by routine
    public function scopeByRoutine($query, $routineId)
    {
        return $query->where('routine_id', $routineId);
    }

    // filter entries by day of week
    public function scopeByDay($query, string $day)
    {
        return $query->where('day_of_week', $day);
    }

    // filter non-cancelled entries
    public function scopeActive($query)
    {
        return $query->where('is_cancelled', false);
    }

    // filter cancelled entries
    public function scopeCancelled($query)
    {
        return $query->where('is_cancelled', true);
    }

    // filter by entry type
    public function scopeType($query, string $type){
        return $query->where('entry_type', $type);
    }

    // get day name from day_of_week
    public function getDayNameAttribute(): string{
        return $this->day_of_week;
    }

    // load entry with all relationships
    public function scopeWithFullDetails($query){
        return $query->with([
            'courseAssignment.course',
            'courseAssignment.teacher.user',
            'courseAssignment.batch',
            'room',
            'timeSlot',
        ]);
    }

    // to cancel this routine entry
    public function cancel(?string $reason=null): bool{
        $this->is_cancelled = true;
        $this->cancellation_reason = $reason;
        return $this->save();
    }

    // to restore cancelled entry
    public function restore():bool{
        $this->is_cancelled = false;
        $this->cancellation_reason = null;
        return $this->save();

    }

}
