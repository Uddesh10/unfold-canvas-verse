import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404: redirecting to home from", location.pathname);
  }, [location.pathname]);

  return <Navigate to="/" replace />;
};

export default NotFound;
