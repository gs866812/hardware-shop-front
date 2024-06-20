import axios from "axios";



const axiosSecure = axios.create({
    baseURL: 'https://api.mozumdarhat.com',
});

const useAxiosSecure = () => {

    return axiosSecure;
};

export default useAxiosSecure;