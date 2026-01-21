import { useState, useEffect } from "react"
import { Bell, Clock, Info } from "lucide-react";
import { toast } from "react-toastify";
import { useNotifications } from "../../contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import axiosClient from "../../services/api/axiosClient";
import { useNavigate } from "react-router-dom";

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchUnreadCount } = useNotifications();
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get('/notifications');
            if (data.success) {
                setNotifications(data.data.data); // as notifications returns pagination
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            toast.error("Could not load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await axiosClient.post('/notifications/mark-all-as-read');
            toast.success('All notifications marked as read');
            fetchNotifications(); //refetch the notifications list 
            fetchUnreadCount(); // update in navbar
        } catch (error) {
            console.error('Mark as read action failed : ', error);
            toast.error('Mark as read failed');
        }
    };

    const handleNotificationClick = async (notify) => {
        // mark as read if it's currently unread
        if (!notify.read_at) {
            try {
                await axiosClient.post(`/notifications/${notify.id}/mark-as-read`);
                fetchUnreadCount(); // update the bell icon count
                setNotifications(prev =>
                    prev.map(n => n.id === notify.id ? { ...n, read_at: new Date() } : n)
                );
            } catch (error) {
                console.error("Error marking notification read:", error);
                toast.error("Error marking notification read");
            }
        }

        // navigate to the routine grid with routine id params
        if (notify.data.action_url) {
            navigate(notify.data.action_url);
        }
    };


    return (
        <section className="max-w-4xl mx-auto p-4 md:p-6 font-general-sans">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        Notifications
                    </h1>
                    <p className="text-sm text-sub-text dark:text-white">Stay updated with system activities</p>
                </div>

                {notifications.length > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-main-blue hover:bg-primary6-blue dark:hover:bg-dark-box rounded-lg transition-all cursor-pointer"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 w-full bg-slate-100 dark:bg-dark-box animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-dark-overlay border border-dashed border-box-outline rounded-2xl">
                    <Info className="mx-auto text-sub-text mb-2 dark:invert" size={40} />
                    <p className="text-sub-text dark:text-white">No notifications found.</p>
                </div>
            ) : (
                <div className="space-y-3 cursor-pointer">
                    {notifications.map((notify) => (
                        <div
                            key={notify.id}
                            onClick={() => handleNotificationClick(notify)}
                            className={`p-4 rounded-md transition-all ${notify.read_at
                                ? "bg-white border border-box-outline dark:bg-dark-box-outline dark:border-0 opacity-70"
                                : "bg-primary6-blue/30 dark:bg-main-blue/10 border-main-blue"
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`mt-1 p-2 ${notify.read_at ? '' : 'text-white'}`}>
                                        <Bell className="text-main-blue" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm dark:text-white">
                                            {notify.data.title || "New Update"}
                                        </h4>
                                        <p className="text-sm text-sub-text dark:text-white mt-1">
                                            {notify.data.message || "A new routine has been published."}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-sub-text dark:text-white font-semibold tracking-wider">
                                            <Clock size={12} />
                                            {formatDistanceToNow(new Date(notify.created_at), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                                {!notify.read_at && (
                                    <div className="h-2 w-2 bg-main-blue rounded-full"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default NotificationList