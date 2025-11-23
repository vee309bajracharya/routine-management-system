<?php

namespace App\Http\Resources\Routines;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoutineListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'effective_from' => $this->effective_from,
            'effective_to' => $this->effective_to,

            'institution' => [
                'id' => $this->institution->id,
                'name' => $this->institution->institution_name,
            ],

            'semester' => [
                'id' => $this->semester->id,
                'name' => $this->semester->semester_name,
            ],

            'batch' => [
                'id' => $this->batch->id ?? null,
                'name' => $this->batch->batch_name ?? null,
            ],

            'generated_by' => [
                'id' => $this->generatedBy->id,
                'name' => $this->generatedBy->name,
            ],
        ];
    }
}
