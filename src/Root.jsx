import { Outlet } from "react-router-dom";
import Sidebar from "./Components/Sidebar/Sidebar";
import './localStyle.css';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';



const Root = () => {
    return (
        <div className="flex">

        <div className="w-[20%] px-5 h-[100vh] overflow-y-scroll sticky top-0 sidebar bg-[#2A3042]">
            <Sidebar/>
        </div>

        <div className="w-[80%] px-2">
            <Outlet/>
        </div>
        <ToastContainer position="bottom-right" autoClose={2000}/>
        </div>
    );
};

export default Root;