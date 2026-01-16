<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('causer')->latest();

        // search within logs
        if ($request->has('search')) {
            $query->where('description', 'like', "%{$request->search}%")
                ->orWhere('subject_type', 'like', "%{$request->search}%");
        }

        $activities = $query->paginate(15);

        // Transform for the Table View
        $activities->getCollection()->transform(function ($activity) {
            $subjectLabel = $activity->subject->title
                ?? $activity->subject->name
                ?? $activity->subject->room_type
                ?? 'ID: ' . $activity->subject_id;
            return [
                'id' => $activity->id,
                'event' => $activity->description,
                'display_title' => "{$subjectLabel} " . ucfirst($activity->description),
                'subject_type' => class_basename($activity->subject_type),
                'user' => $activity->causer->name ?? 'System',
                'date' => $activity->created_at->format('d/m/Y H:i:s'),
                'time_ago' => $activity->created_at->diffForHumans(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }

    public function show($id)
    {
        $activity = Activity::with('causer')->findOrFail($id);
        $properties = $activity->properties;
        $changes = [];

        // "Old vs New" comparison table
        if (isset($properties['attributes'])) {
            foreach ($properties['attributes'] as $key => $newValue) {
                // ignore system timestamps
                if (in_array($key, ['created_at', 'updated_at', 'deleted_at']))
                    continue;

                $oldValue = $properties['old'][$key] ?? 'N/A';

                if ($oldValue != $newValue) {
                    $changes[] = [
                        'field' => str_replace('_', ' ', ucfirst($key)),
                        'old' => is_array($oldValue) ? json_encode($oldValue) : $oldValue,
                        'new' => is_array($newValue) ? json_encode($newValue) : $newValue,
                    ];
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $activity->id,
                'event' => ucfirst($activity->description),
                'subject' => class_basename($activity->subject_type),
                'performer' => $activity->causer->name ?? 'System',
                'date' => $activity->created_at->format('d/m/Y, H:i:s'),
                'changes' => $changes
            ]
        ]);
    }
}
