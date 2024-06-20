import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { ContextData } from '../../Provider';
import { toast } from 'react-toastify';

const axiosProtect = axios.create({
    baseURL: 'https://api.mozumdarhat.com',
    withCredentials: true
});

const useAxiosProtect = () => {
    const {logOut} = useContext(ContextData);
    const navigate = useNavigate();

    useEffect(() => {

        const interceptor = axiosProtect.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error) {
                    logOut()
                        .then(() => navigate("/login"))
                        .catch((err) => toast.error(err));
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosProtect.interceptors.response.eject(interceptor);
        };
    }, []);

    return axiosProtect;
};

export default useAxiosProtect;
