<?php

namespace App\Http\Resources\Routines;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoutineSavedVersionResource extends JsonResource
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
            'routine_id' => $this->routine_id,
            'label' => $this->label,
            'description' => $this->description,
            'saved_date' => $this->saved_date,
            'created_at' => $this->created_at,
            'created_by' => $this->createdBy?->id,

            // for preview
            'entries' => is_string($this->routine_snapshot)
                ? json_decode($this->routine_snapshot, true)
                : $this->routine_snapshot,
        ];
    }
}
