<?php

namespace App\Http\Controllers\Common;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // list all notifications
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->paginate(10);
        return response()->json([
            'success' => true,
            'data' => $notifications,
        ], 200);
    }

    //get the count of unread notifications for the auth user
    public function getUnreadCount(Request $request)
    {
        return response()->json([
            'success' => true,
            'unread_count' => $request->user()->unreadNotifications()->count()
        ], 200);
    }

    // mark all as read
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ], 200);
    }

    // mark as read
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read'
        ],200);
    }
}
