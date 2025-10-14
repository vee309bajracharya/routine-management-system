<?php

namespace App\Models;

use Carbon\Carbon;
use App\Models\Batch;
use App\Models\Routine;
use App\Models\AcademicYear;
use App\Models\CourseAssignment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Semester extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'academic_year_id',
        'semester_name',
        'semester_number',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    // get the academic year that owns this sem
    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    // get all batches in this sem
    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    // get all course assignment in this sem
    public function courseAssignments()
    {
        return $this->hasMany(CourseAssignment::class);
    }

    // get all routines in this sem
    public function routines()
    {
        return $this->hasMany(Routine::class);
    }
    
    // to check if semester is currently active
    public function isCurrentlyActive(): bool
    {
        $today = now()->toDateString();
        $startDate = Carbon::parse($this->start_date)->toDateString();
        $endDate = Carbon::parse($this->end_date)->toDateString();
        return $this->is_active &&
            $today >= $startDate &&
            $today <= $endDate;
    }

    // ===Scopes===

    // filter the active semesters
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // filter the academic year
    public function scopeByAcademicYear($query, $academicYearId)
    {
        return $query->where('academic_year_id', $academicYearId);
    }

}
