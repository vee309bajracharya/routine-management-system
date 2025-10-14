<?php

namespace App\Models;

use App\Models\User;
use App\Models\Batch;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Institution;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'institution_id',
        'department_name',
        'code',
        'head_teacher_id',
        'description',
        'status',
    ];

    // department owned by the institution
    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    // get the HOD
    public function headTeacher()
    {
        return $this->belongsTo(User::class, 'head_teacher_id');
    }

    // all teachers in this department
    public function teachers()
    {
        return $this->hasMany(Teacher::class);
    }

    // get all courses in this department
    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    // get all batches in this department
    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    // ===== Scopes ======

    // departments filter based on institution
    public function scopeByInstitution($query,$institutionId){
        return $query->where('institution_id',$institutionId);
    }

    // filter active departments
    public function scopeActive($query){
        return $query->where('status','active');
    }

}
