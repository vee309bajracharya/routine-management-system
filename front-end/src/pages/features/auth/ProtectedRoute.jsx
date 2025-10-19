import { Navigate } from "react-router-dom"

const ProtectedRoute = ({children, role}) => {

    const token = sessionStorage.getItem('auth_token');
    const userData = sessionStorage.getItem('user_data');

    if(!token || !userData){
        return <Navigate to={`/${role}-login`} replace/>;
    }

  return children;
};

export default ProtectedRoute