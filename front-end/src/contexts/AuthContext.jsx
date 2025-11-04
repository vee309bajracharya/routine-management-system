import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../services/api/axiosClient";

// create AuthContext
const AuthContext = createContext({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
    isLoading: true,
});

export const AuthProvider = ({ children }) => {

    // store user data
    const [user, setUser] = useState(null);

    // store auth token
    const [token, setToken] = useState(null);

    // to check auth status
    const [isLoading, setIsLoading] = useState(true);

    // initialize auth state from storage (local or session Storage) based on Remember Me option
    useEffect(() => {

        // check both session and local storage
        const sessionToken = sessionStorage.getItem('auth_token');
        const localToken = localStorage.getItem('auth_token');
        const storedToken = sessionToken || localToken;

        const sessionUser = sessionStorage.getItem('user_data');
        const localUser = localStorage.getItem('user_data');
        const storedUser = sessionUser || localUser;

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchUserData(storedToken);
            } catch (error) {
                console.error('Error parsing stored user data: ', error);
                clearAllStorage();
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // to fetch current user data from API for token validity
    const fetchUserData = async (authToken) => {
        try {
            const response = await axiosClient.get('/auth/user', {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            // get the back-end response
            if (response.data.success && response.data.data) {
                setUser(response.data.data);

                // update storage based on where token was found
                if (localStorage.getItem('auth_token')) {
                    localStorage.setItem('user_data', JSON.stringify(response.data.data));
                } else {
                    sessionStorage.setItem('user_data', JSON.stringify(response.data.data));
                }
            }
        } catch (error) {
            console.error('Failed to fetch user data : ', error);
            logout(); //if fetching fails, clear the stored data
        } finally {
            setIsLoading(false);
        }
    };

    // user login and store the response
    /*
        user login with Remember Me option
        if true, use localStorage else use sessionStorage
    */
    const login = async (email, password, role = "teacher", rememberMe = false) => {
        try {
            //determine role
            const loginRoute = role === 'admin' ? '/auth/admin-login' : 'auth/teacher-login';

            //login API call
            const response = await axiosClient.post(loginRoute, {
                email,
                password,
            });

            // get back-end response
            if (response.data.success && response.data.data) {
                const authToken = response.data.data.access_token;
                const userData = response.data.data.user;

                // validate token and user data
                if (!authToken || !userData) throw new Error('Invalid login response from server');

                // store auth_token and user_data based on Remember Me option
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('auth_token', authToken);
                storage.setItem('user_data', JSON.stringify(userData));

                // update state
                setToken(authToken);
                setUser(userData);

                return {
                    success: true,
                    user: userData
                };
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            // errors from axios interceptor
            const userMessage = error.userMessage
                || error.response?.data?.message
                || error.message
                || 'Login failed. Please try again';
            throw new Error(userMessage);
        }
    };

    // user logout and clear the stored data
    const logout = async () => {
        try {
            if (token) {
                await axiosClient.post('/auth/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Logout error : ', error);
        } finally {
            clearAllStorage();
            setToken(null);
            setUser(null);
        }
    };

    // function to clear both storages
    const clearAllStorage = () => {
        sessionStorage.clear();
        localStorage.clear();
    }

    // is authenticated
    const isAuthenticated = !!(token && user);

    // context value
    const contextValue = {
        user, // current user_data
        token, // auth_token
        login, // login method
        logout, // logout method
        isAuthenticated, // is user logged in
        isLoading, // is auth state being checked
    };

    // context to children components
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// custom hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be within an AuthProvider');
    }
    return context;
}

export default AuthContext;