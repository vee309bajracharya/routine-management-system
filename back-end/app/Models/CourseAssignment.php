<?php

namespace App\Models;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Routine;
use App\Models\Teacher;
use App\Models\Semester;
use App\Models\Department;
use App\Models\RoutineEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseAssignment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'course_id',
        'teacher_id',
        'batch_id',
        'semester_id',
        'department_id',
        'assignment_type',
        'status',
        'notes',
    ];

    // get the course assigned
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    // get the teacher assigned for this course
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    // get the batch of this assigned course
    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    // get the semester of this assigned course
    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    // get the routine_entries of this assigned course
    public function routineEntries()
    {
        return $this->hasMany(RoutineEntry::class);
    }

    public function routines()
    {
        return $this->hasMany(Routine::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }


    // ===scopes====

    // filter course assignments by teacher
    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    // filter assignments by batch
    public function scopeByBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }

    // filter assignments by semester
    public function scopeBySemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    // filter active assignments
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // filter by assignment type
    public function scopeType($query, string $type)
    {
        return $query->where('assignment_type', $type);
    }

    // load all relationships details
    public function scopeWithFullDetails($query)
    {
        return $query->with([
            'course',
            'teacher.user',
            'teacher.department',
            'batch',
            'semester.academicYear',
        ]);
    }
}
