import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosClient from "../services/api/axiosClient";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await axiosClient.get('/notifications/unread-count');
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error('Error fetching notifications : ', error);
        }
    }, [user]);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 120000); //every 2mins
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const contextValue = {
        unreadCount,
        fetchUnreadCount
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be within an NotificationProvider');
    }
    return context;
}
export default NotificationContext;