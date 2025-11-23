<?php

namespace App\Models;

use App\Models\Teacher;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TeacherAvailability extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'teacher_availability'; // default: 'teacher_availabilities' but used 'teacher_availability' as migration 

    protected $fillable = [
        'teacher_id',
        'day_of_week',
        'available_from',
        'available_to',
        'is_available',
        'notes',
    ];

    protected $casts = [
        'available_from' => 'datetime:H:i',
        'available_to' => 'datetime:H:i',
        'is_available' => 'boolean',
    ];

    // teacher that owns this availability
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    // get day name
    public function getDayNameAttribute(): string
    {
        return $this->day_of_week;
    }

    // get formatted time range
    public function getTimeRangeAttribute(): string
    {
        return $this->available_from->format('H:i') . '-' . $this->available_to->format('H:i');
    }

    // ==== scopes ====

    // filter availability by teacher
    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    // filter availability by day
    public function scopeByDay($query, string $day)
    {
        return $query->where('day_of_week', $day);
    }

    // filter available slots
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    // filter un-available slots
    public function scopeUnavailable($query)
    {
        return $query->where('is_available', false);
    }

    // ======
    //to check if teacher is available at specific time on specific day
    public function isAvailable(string $day, string $time): bool
    {
        if ($this->day_of_week !== $day)
            return false;

        if (!$this->is_available)
            return false;

        return $time >= $this->available_from->format('H:i') &&
            $time <= $this->available_to->format('H:i');

    }
}
