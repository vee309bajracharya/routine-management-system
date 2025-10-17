import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../services/api/axiosClient";

// create AuthContext
const AuthContext = createContext({
    user: null,
    token: null,
    login: ()=>{},
    logout: ()=>{},
    isAuthenticated: false,
    isLoading: true,
});

export const AuthProvider = ({children})=>{

    // store user data
    const [user, setUser] = useState(null);

    // store auth token
    const [token, setToken] = useState(null);

    // to check auth status
    const [isLoading, setIsLoading] = useState(true);

    // initialize auth state from sessionStorage if user was previously logged in
    useEffect(()=>{
        //get data from sessionStorage
        const storedToken = sessionStorage.getItem('auth_token');
        const storedUser = sessionStorage.getItem('user_data');

        if(storedToken && storedUser){
            //restore token and user data
            setToken(storedToken);
            setUser(JSON.parse(storedUser));

            fetchUserData(storedToken);
        }else{
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    // to fetch current user data from API for token validity
    const fetchUserData = async(authToken)=>{
        try {
            const response = await axiosClient.get('/auth/user',{
                headers:{
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if(response.data.success){
                setUser(response.data.user);
                sessionStorage.setItem('user_data', JSON.stringify(response.data.user));
            }
        } catch (error) {
            console.error('Failed to fetch user data : ',error);

            logout(); //if fetching fails, clear the stored data
        }  finally{
            setIsLoading(false);
        }
    };

    // user login and store the response
    const login = async(email, password, role="teacher")=>{
        try {
            //determine role
            const loginRoute = role === 'admin' ? '/auth/admin-login' : 'auth/teacher-login';

            //login API call
            const response = await axiosClient.post(loginRoute,{
                email,
                password,
            });
            if(response.data.success){
                const {
                    token: authToken,
                    user: userData
                } = response.data;

                // store auth_token and user_data in sessionStorage
                sessionStorage.setItem('auth_token',authToken);
                sessionStorage.setItem('user_data', JSON.stringify(userData));

                // update state
                setToken(authToken);
                setUser(userData);

                return {
                    success:true,
                    user: userData
                };
            }else{
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error : ', error);
            const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
            throw new Error(errorMsg);
        }
    };

    // user logout and clear the stored data
    const logout = async()=>{
        try {
            if(token){
                await axiosClient.post('/auth/logout',{},{
                    headers:{
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Logout error : ', error);
        } finally{
            //clear sessionStorage and state
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('user_data');
            setToken(null);
            setUser(null);
        }
    };

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
export const useAuth = ()=>{
    const context = useContext(AuthContext);
    if(!context){
        throw new Error('useAuth must be within an AuthProvider');
    }
    return context;
}

export default AuthContext;