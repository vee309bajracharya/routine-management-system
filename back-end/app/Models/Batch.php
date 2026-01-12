<?php

namespace App\Models;

use App\Models\Routine;
use App\Models\Semester;
use App\Models\TimeSlot;
use App\Models\Department;
use App\Models\Institution;
use App\Models\CourseAssignment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Batch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'institution_id',
        'department_id',
        'semester_id',
        'batch_name',
        'code',
        'year_level',
        'shift',
        'status',
    ];

    // get the institution that owns this batch
    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    // get the department of this batch
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    // get the sem of this batch
    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    // timeslots of this batch
    public function timeSlots()
    {
        return $this->hasMany(TimeSlot::class);
    }

    // get all course assignments for this batch
    public function courseAssignments()
    {
        return $this->hasMany(CourseAssignment::class);
    }

    //get all routines for this batch
    public function routines()
    {
        return $this->hasMany(Routine::class);
    }

    // ===scopes===

    // filter batches by institution
    public function scopeByInstitution($query, $institutionId)
    {
        return $query->where('institution_id', $institutionId);
    }

    // filter batches by department
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    // filter batches by semester
    public function scopeBySemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    // filter active batches
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // filter by shift
    public function scopeShift($query, string $shift)
    {
        return $query->where('shift', $shift);
    }
}
