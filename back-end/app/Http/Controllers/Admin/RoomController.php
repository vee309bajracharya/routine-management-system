<?php

namespace App\Http\Controllers\Admin;

use App\Models\Room;
use Illuminate\Http\Request;
use App\Services\CacheService;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class RoomController extends Controller
{
    private const ROOM_CACHE_TTL = 3600;

    /**
     * Get all rooms
     */
    public function index(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;

            $cacheKey = "institution:{$institutionId}:rooms:list:" . md5(json_encode($request->query()));

            $rooms = CacheService::remember($cacheKey, function () use ($institutionId, $request) {
                $query = Room::where('institution_id', $institutionId);

                // Filter by room type
                if ($request->filled('room_type')) {
                    $query->where('room_type', $request->room_type);
                }

                // Filter by status
                if ($request->filled('status')) {
                    $query->where('status', $request->status);
                }

                // Search by name, room number
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('room_number', 'like', "%{$search}%");
                    });
                }

                return $query->orderBy('room_number', 'asc')->paginate(10);
            }, self::ROOM_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Rooms fetched successfully',
                'data' => $rooms->map(function ($room) {
                    return [
                        'id' => $room->id,
                        'name' => $room->name,
                        'room_number' => $room->room_number,
                        'room_type' => $room->room_type,
                        'status' => $room->status,
                    ];
                }),
                'pagination' => [
                    'current_page' => $rooms->currentPage(),
                    'last_page' => $rooms->lastPage(),
                    'per_page' => $rooms->perPage(),
                    'total' => $rooms->total(),
                ]
            ], 200);

        } catch (\Exception $e) {
            $this->errorResponse('Failed to fetch rooms', $e->getMessage());
        }
    }

    /**
     * Create new room
     */
    public function store(Request $request)
    {
        $institutionId = auth()->user()->institution_id;

        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('rooms')->where('institution_id', $institutionId)
            ],
            'room_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('rooms')->where('institution_id', $institutionId)
            ],
            'room_type' => 'required|in:Lecture Hall,Lab,Classroom',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $room = Room::create([
                'institution_id' => $institutionId,
                'name' => $request->name,
                'room_number' => $request->room_number,
                'room_type' => $request->room_type,
                'status' => $request->status ?? 'active',
            ]);

            // Clear caches
            CacheService::forgetPattern("institution:{$institutionId}:rooms*");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Room created successfully',
                'data' => [
                    'id' => $room->id,
                    'name' => $room->name,
                    'room_number' => $room->room_number,
                    'room_type' => $room->room_type,
                    'status' => $room->status,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse('Failed to create room', $e->getMessage());
        }
    }

    /**
     * Update room
     */
    public function update(Request $request, $id)
    {
        $institutionId = auth()->user()->institution_id;
        $room = Room::where('institution_id', $institutionId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('rooms')->where('institution_id', $institutionId)->ignore($id)
            ],
            'room_number' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('rooms')->where('institution_id', $institutionId)->ignore($id)
            ],
            'room_type' => 'sometimes|in:Lecture Hall,Lab,Classroom',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Update fields
            if ($request->has('name')) {
                $room->name = $request->name;
            }
            if ($request->has('room_number')) {
                $room->room_number = $request->room_number;
            }
            if ($request->has('room_type')) {
                $room->room_type = $request->room_type;
            }
            if ($request->has('status')) {
                $room->status = $request->status;
            }

            $room->save();

            // Clear caches
            CacheService::forget("room:{$id}:details");
            CacheService::forgetPattern("institution:{$institutionId}:rooms*");
            CacheService::forget(CacheService::roomAvailabilityKey($id));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Room updated successfully',
                'data' => [
                    'id' => $room->id,
                    'name' => $room->name,
                    'room_number' => $room->room_number,
                    'room_type' => $room->room_type,
                    'status' => $room->status,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse('Failed to update room', $e->getMessage());
        }
    }

    /**
     * delete room
     */
    public function destroy($id)
    {
        $institutionId = auth()->user()->institution_id;
        $room = Room::where('institution_id', $institutionId)->findOrFail($id);
        DB::beginTransaction();
        try {
            $room->forceDelete();

            // Clear caches
            CacheService::forget("room:{$id}:details");
            CacheService::forgetPattern("institution:{$institutionId}:rooms*");
            CacheService::forget(CacheService::roomAvailabilityKey($id));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Room deleted permanently'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse('Failed to delete room', $e->getMessage());
        }
    }

    // private helper method
    private function errorResponse($message, $error, $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $error,
        ], $status);
    }
}
