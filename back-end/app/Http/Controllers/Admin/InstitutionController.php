<?php

namespace App\Http\Controllers\Admin;

use App\Models\Institution;
use Illuminate\Http\Request;
use App\Services\CacheService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class InstitutionController extends Controller
{
    private const INSTITUTION_CACHE_TTL = 3600;

    /**
     * get institution details
     */
    public function show(Request $request)
    {
        try {
            $institutionId = auth()->user()->institution_id;

            $cacheKey = "institution:{$institutionId}:details";

            $institution = CacheService::remember($cacheKey, function () use ($institutionId) {
                return Institution::findOrFail($institutionId);
            }, self::INSTITUTION_CACHE_TTL);

            return response()->json([
                'success' => true,
                'message' => 'Institution details fetched successfully',
                'data' => [
                    'id' => $institution->id,
                    'institution_name' => $institution->institution_name,
                    'type' => $institution->type,
                    'address' => $institution->address,
                    'contact_email' => $institution->contact_email,
                    'contact_phone' => $institution->contact_phone,
                    'logo' => $institution->logo ? asset('storage/' . $institution->logo) : null,
                    'status' => $institution->status,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch institution details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * update institution details
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'institution_name' => 'required|string|max:255',
            'type' => 'required|in:University, College, School, Institute',
            'address' => 'nullable|string|max:500',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:15',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'status' => 'nullable|in:active,inactive'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            $institutionId = auth()->user()->institution_id;
            $institution = Institution::findOrFail($institutionId);

            // logo update
            if ($request->hasFile('logo')) {

                //delete if old logo exists
                if ($institution->logo && Storage::disk('public')->exists($institution->logo)) {
                    Storage::disk('public')->delete($institution->logo);
                }

                // store new logo
                $logoPath = $request->file('logo')->store('institution/logos', 'public');
                $institution->logo = $logoPath;
            }

            //update institution details
            $institution->institution_name = $request->institution_name;
            $institution->type = $request->type;
            $institution->address = $request->address;
            $institution->contact_email = $request->contact_email;
            $institution->contact_phone = $request->contact_phone;

            if ($request->has('status')) {
                $institution->status = $request->status;
            }

            $institution->save();

            CacheService::clearInstitutionCaches($institutionId); //clear institution cache

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Institution details updated successfully',
                'data' => [
                    'id' => $institution->id,
                    'institution_name' => $institution->institution_name,
                    'type' => $institution->type,
                    'address' => $institution->address,
                    'contact_email' => $institution->contact_email,
                    'contact_phone' => $institution->contact_phone,
                    'logo' => $institution->logo ? asset('storage/' . $institution->logo) : null,
                    'status' => $institution->status,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update institution details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // delete institution logo only
    public function deleteLogo(Request $request)
    {
        try {
            DB::beginTransaction();

            $institutionId = auth()->user()->institution_id;
            $institution = Institution::findOrFail($institutionId);

            if ($institution->logo && Storage::disk('public')->exists($institution->logo)) {
                Storage::disk('public')->delete($institution->logo);
                $institution->logo = null;
                $institution->save();

                CacheService::forget("institution:{$institutionId}:details"); //clear cache

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Logo deleted successfully',
                ], 200);
            }
            return response()->json([
                'success' => false,
                'message' => 'No logo found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete logo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
