import React, { useContext, useState } from 'react';
import { FaRegUser } from 'react-icons/fa';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { MdHttp, MdOutlineMail } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { ContextData } from '../../Provider';
import Swal from 'sweetalert2';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const {createUser,  user} = useContext(ContextData);



    const handleRegister = (e) => {
        e.preventDefault();
        const form = e.target;
        const userName = form.name.value;
        const email = form.email.value;
        const password = form.password.value;


        if (password.length < 6){
            Swal.fire({
                text: "Password should be minimum 6 character or longer",
                icon: "warning"
            })
            return;
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,16}$/.test(password)){
            Swal.fire({
                text: "Password must contains at least one uppercase letter, one lowercase letter, a number, and a special character.",
                icon: "warning"
            })
            return;
        }

        // create user with Email
        createUser(email, password)
        .then((result) => {
            // Signed up 
            const user = result.user;
                       
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            Swal.fire({
                title: errorCode,
                text: errorMessage,
                icon: "error"
            })
            // ..
          });

    };



    return user ? (
        navigate("/")
      ) : (
        <div className='fanwood flex justify-center items-center lg:py-8 px-4'>
          <div className="flex flex-col bg-white lg:p-14 md:p-10 p-5 lg:w-1/2 md:w-2/3 gap-3 mx-auto max-w-screen-2xl lg:bg-opacity-90 shadow-md border rounded-md">
            <h2 className="lg:text-3xl text-2xl font-bold">Register</h2>
            <hr className="border-2 border-blue-500 w-[24%]" />
            <p className="lg:mt-5">
              Join our community of artisans and start showcasing your jute and
              wooden crafts today!
            </p>
            <p className="lg:my-3">Fill out the form below to get started:</p>
    
            <form className="flex flex-col gap-5" onSubmit={handleRegister}>
              <label className="input input-bordered flex items-center gap-2">
                <FaRegUser />
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name*"
                  required
                  className="w-full"
                />
              </label>
    
              <label className="input input-bordered flex items-center gap-2">
                <MdOutlineMail />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email*"
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
                  className="absolute right-4"
                >
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </span>
              </label>
              <small className="text-xs -mt-3">
                *Password must contains uppercase, lowercase, number and special
                character
              </small>
    
              <button className=" py-2 px-5 rounded-md w-full bg-blue-500 text-white mt-5">
                Register
              </button>
            </form>
            <p className="text-center">
              Have an account?{" "}
              <Link to="/login" className="underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      );
    };

export default Register;