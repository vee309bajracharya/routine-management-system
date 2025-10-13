<?php

namespace App\Models;

use App\Models\Semester;
use App\Models\Institution;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class AcademicYear extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'institution_id',
        'year_name',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    // institution that owns the academic year
    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    // all semesters of this academic year
    public function semesters()
    {
        return $this->hasMany(Semester::class);
    }

    // get the active semesters in this academic year
    public function activeSemesters()
    {
        return $this->hasMany(Semester::class)->where('is_active', true);
    }

    // to check if academic year is currently active
    public function isCurrentlyActive(): bool{
        $today = now()->toDateString();
        $startDate = Carbon::parse($this->start_date)->toDateString();
        $endDate = Carbon::parse($this->end_date)->toDateString();
        return $this->is_active &&
            $today >= $startDate &&
            $today <= $endDate;
    }

    // ===== Scopes ======

    // filter active academic year
    public function scopeActive($query){
        return $query->where('is_active',true);
    }

    // filter by institution
    public function scopeByInstitution($query, $institutionId){
        return $query->where('institution_id',$institutionId);
    }
}
