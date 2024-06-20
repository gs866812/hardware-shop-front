import { useContext } from "react";
import { ContextData } from "../../Provider";




const useAuth = () => {
    const authentication = useContext(ContextData);
    return authentication;
};

export default useAuth;