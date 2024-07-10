import { useContext } from "react";
import { ContextData } from "../../Provider";
import { Navigate, useLocation } from "react-router-dom";

const Protected = ({ children }) => {
  const { user, loading } = useContext(ContextData);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center lg:p-20 mt-5 lg:mt-0">
        <span className="loading loading-ring loading-lg flex justify-center items-center"></span>
      </div>
    );
  }

  if (user) {
    return children;
  }

  return <Navigate state={{ from: location }} to='/login' />;
};

export default Protected;
