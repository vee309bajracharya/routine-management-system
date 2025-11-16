<?php

namespace App\Models;

use App\Models\User;
use App\Models\Department;
use App\Models\Institution;
use App\Models\CourseAssignment;
use App\Models\RoutineNotification;
use App\Models\TeacherAvailability;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'user_id',
        'institution_id',
        'department_id',
    ];

    // get the institution that owns the teacher
    public function institution(){
        return $this->belongsTo(Institution::class);
    }

    // get the user that owns the teacher
    public function user(){
        return $this->belongsTo(User::class);
    }

    // get the course assignment for the teacher
    public function courseAssignments(){
        return $this->hasMany(CourseAssignment::class);
    }

    // get the teacher availability
    public function availability(){
        return $this->hasMany(TeacherAvailability::class);
    }

    // get the routine notifications
    public function routineNotifications(){
        return $this->hasMany(RoutineNotification::class);
    }

    // ===== Scopes ======

    // to filter teachers by institutions
    public function scopeByInstitution($query, $institutionId){
        return $query->where('institution_id', $institutionId);
    }

    // to filter full_time teachers
    public function scopeFullTime($query){
        return $query->where('employment_type', 'full_time');
    }

    // to filter part_time teachers
    public function scopePartTime($query){
        return $query->where('employment_type','part_time');
    }
}
