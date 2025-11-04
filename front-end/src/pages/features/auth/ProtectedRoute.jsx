import { Navigate } from "react-router-dom"
import { useAuth } from "../../../contexts/AuthContext";
import Loader from "../../../components/common/Loader";

// children - component to be rendered if authenticated
// role - required role ('admin' or 'teacher')

const ProtectedRoute = ({ children, role }) => {

  const { isAuthenticated, isLoading, user } = useAuth();

  // to show loader while auth state is being checked
  if (isLoading) return <Loader />;

  // if not, redirect to login
  if (!isAuthenticated) return <Navigate to={`/${role}-login`} replace />;

  // check if user has required role
  if (user && user.role) {
    const userRole = user.role.toLowerCase();
    const requiredRole = role.toLowerCase();

    if (userRole !== requiredRole){
      if (userRole === 'admin'){
        return <Navigate to='/admin/dashboard' replace />;
      }else if (userRole === 'teacher'){
        return <Navigate to='/teacher/dashboard' replace />;
      } else {
        return <Navigate to={`/${role}-login`} replace />;
      }
    }
  }

  // user is authenticated and has correct role
  return children;

};

export default ProtectedRoute