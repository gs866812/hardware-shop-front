import axios from "axios";



const axiosSecure = axios.create({
    baseURL: 'https://hardware-shop-server.vercel.app',
});

const useAxiosSecure = () => {

    return axiosSecure;
};

export default useAxiosSecure;