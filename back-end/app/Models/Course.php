<?php

namespace App\Models;

use App\Models\Teacher;
use App\Models\Department;
use App\Models\Institution;
use App\Models\CourseAssignment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Course extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'institution_id',
        'department_id',
        'course_name',
        'code',
        'description',
        'course_type',
        'status',
        'semester_number',
    ];
    // get the institution that owns the course
    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    // get the department that owns the course
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    // get all course assignments for this course
    public function courseAssignments()
    {
        return $this->hasMany(CourseAssignment::class);
    }

    // get teachers assigned to this course through course assignments
    public function assignedTeachers()
    {
        return $this->belongsToMany(Teacher::class, 'course_assignments')
            ->withPivot('batch_id', 'semester_id', 'assignment_type', 'status')
            ->withTimestamps();
    }

    // ===scopes===

    //filter courses by institution
    public function scopeByInstitution($query, $institutionId)
    {
        return $query->where('institution_id', $institutionId);
    }

    //filter courses by department
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    // filter active courses
    public function scopeActive($query){
        return $query->where('status','active');
    }

    // filter by course type
    public function scopeType($query, string $type){
        return $query->where('course_type', $type);
    }

    // filter by semester number
    public function scopeBySemesterNumber($query, int $semesterNumber){
        return $query->where('semester_number', $semesterNumber);
    }
}
