<?php

namespace App\Models;

use App\Models\Room;
use App\Models\Batch;
use App\Models\Course;
use App\Models\Routine;
use App\Models\Teacher;
use App\Models\TimeSlot;
use App\Models\Department;
use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Institution extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'institution_name',
        'type',
        'address',
        'contact_email',
        'contact_phone',
        'logo',
        'settings',
        'status',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    // get all departments of this institution
    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    // get all teachers of this institution
    public function teachers()
    {
        return $this->hasMany(Teacher::class);
    }

    // get all academic years of this institution
    public function academicYears()
    {
        return $this->hasMany(AcademicYear::class);
    }

    // get all batches of this institution
    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    // get all courses of this institution
    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    // get all rooms of this institution
    public function rooms()
    {
        return $this->hasMany(Room::class);
    }

    // get all time slots of this institution
    public function timeSlots()
    {
        return $this->hasMany(TimeSlot::class);
    }

    // get all routines of this institution
    public function routines()
    {
        return $this->hasMany(Routine::class);
    }

    // ===== Scopes ======

    // filter institution type
    public function scopeType($query, string $type){
        return $query->where('type',$type);
    }

    // filter active institutions
    public function scopeActive($query){
        return $query->where('status','active');
    }

    // get the active academic years of this institution
    public function activeAcademicYears(){
        return $this->hasMany(AcademicYear::class)->where('is_active');
    }
}
