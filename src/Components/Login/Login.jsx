import React, { useContext, useState, useEffect } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { ContextData } from "../../Provider";
import Swal from "sweetalert2";
import logo from '../../assets/images/logo_white.png';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithEmail, user, setUser } = useContext(ContextData);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleEmailLogin = (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    loginWithEmail(email, password)
      .then((result) => {
        // Signed in
        navigate(from, { replace: true });
        const user = result.user;
        setUser(user);
        Swal.fire({
          title: "Login successfully",
          icon: "success",
        });

        // navigate(location?.state ? location.state : "/");
        
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Swal.fire({
          title: errorCode,
          text: errorMessage,
          icon: "error",
        });
      });
  };

  return (
    <div className="fanwood flex justify-center items-center lg:py-8 px-4 bg-gray-700">
      <div className="flex flex-col bg-gray-700 lg:p-14 md:p-10 p-5 lg:w-1/2 md:w-2/3 gap-3 mx-auto max-w-screen-2xl lg:bg-opacity-90 shadow-md border rounded-md">
        <div><img src={logo} alt="" /></div>
        

        <form className="flex flex-col gap-5 mt-5" onSubmit={handleEmailLogin}>
          <label className="input input-bordered flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full"
            />
          </label>

          <label className="input input-bordered flex items-center gap-2 relative">
            <RiLockPasswordLine />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              className="w-full pr-5"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 cursor-pointer"
            >
              {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
            </span>
          </label>

          <button className="py-2 px-5 rounded-md w-full custom-button bg-green-500 text-white">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
