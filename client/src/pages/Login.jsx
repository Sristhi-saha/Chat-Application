import React, { useEffect } from 'react'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { MdEmail } from "react-icons/md";
import { useRef } from 'react';
import { MdLock } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { TbLockPassword } from "react-icons/tb";
import { TbPassword } from "react-icons/tb";
import { MdUpload } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserID } from '../redux/USerSlice.js';
import axios from 'axios';


const Login = () => {
  const dispatch = useDispatch();
  const user = useSelector((state)=>state.User);
  console.log(user);
  const [isLogin, setIsLogin] = useState(false);
  const fileRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profilePicture: null
  });
  
  const [showicon, setShowIcon] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    const res = !isLogin ? 
    await axios.post("http://localhost:8000/api/auth/register", formData,{
      withCredentials:true,
    }) : 
    await axios.post("http://localhost:8000/api/auth/login", {email:formData.email,password:formData.password},{
      withCredentials:true,
    });
    const data = res.data;
    console.log(res);
    dispatch(setUserID(res.data.user._id));
    localStorage.setItem('id',res.data.user._id);
    if(data){
      navigate('/profile');
    }
    setFormData({
      name: '',
      email: '',
      password: '',
    })
    if (fileRef.current) fileRef.current.value = '';
  }
  const handleButtonClick = () => {
    setIsLogin(!isLogin)
  }
  return (
    <>
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#dde8f0] to-[#c5d8e8] p-12">
        <div className='relative overflow-hidden shadow-2xl shadow shadow-[0_4px_15px_rgba(63,118,172,0.3),0_10px_40px_rgba(63,118,172,0.2)] w-[800px] h-[540px] rounded-lg m-10 flex items-center justify-center'>
          <motion.div
            animate={{ x: isLogin ? 400 : 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className={`bg-[#3f76ac]  h-full ${!isLogin ? "rounded-l-lg" : "rounded-r-lg"} flex items-center justify-center flex-col w-1/2`}>
            <h1 className='text-3xl text-white font-bold'>Welcome To {isLogin ? "Sign In" : "Sign Up"}</h1>
            <p className='text-[18px] text-[#f2ebeb]'>Fast, secure, and easy messaging starts here.</p>
            <button onClick={() => handleButtonClick()} className='w-45 bg-white mt-5 p-2 text-[#3F76AC] font-semibold rounded-xs text-xl cursor-pointer'>{isLogin ? "Sign Up" : "Sign In"}</button>
          </motion.div>
          {isLogin ?
            <motion.div
              animate={{ x: isLogin ? -400 : 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className={`bg-white w-1/2 h-full flex items-center justify-center ${!isLogin ? "rounded-r-lg" : "rounded-l-lg"}`}>
              <form className='flex flex-col justify-center items-center gap-5 w-3/4' onSubmit={(e) => handleSubmit(e)}>
                <h1 className='text-3xl text-[#3F76AC] font-bold'>Sign In</h1>

                <div className='relative w-full'>
                  <MdEmail className='absolute left-4 top-1/2 -translate-y-1/2 text-[#3f76ac] text-xl' />
                  <input
                    type="email"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    value={formData.email}
                    placeholder='Enter Email....'
                    className='border-2 border-[#3F76AC] outline-none p-3 rounded-2xl w-full pl-11'
                  />
                </div>

                <div className='relative w-full'>
                  <MdLock className='absolute left-4 top-1/2 -translate-y-1/2 text-[#3f76ac] text-xl' />
                  <input
                    type="password"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    value={formData.password}
                    placeholder='Enter Password....'
                    className='border-2 border-[#3F76AC] outline-none p-3 rounded-2xl w-full pl-11'
                  />
                </div>

                <span className='text-red-400 hover:underline text-sm cursor-pointer' style={{ marginTop: "-10px", marginBottom: "-10px" }}>
                  Forgot Password?
                </span>

                <button className='w-full rounded-xl bg-[#3F76AC] p-3 text-white font-semibold cursor-pointer'>
                  Submit
                </button>
              </form>
            </motion.div> : <motion.div
              animate={{ x: isLogin ? -400 : 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="bg-white w-1/2 h-full flex items-center justify-center rounded-r-lg ">
              <form className='flex flex-col justify-center items-center gap-5 w-3/4' onSubmit={(e) => handleSubmit(e)}>
                <h1 className='text-3xl text-[#3F76AC] font-bold'>Sign Up</h1>
                <div className="relative w-full">
                  <IoPerson className='absolute top-1/2 left-4 -translate-y-1/2 text-[#3f76ac] text-xl' />
                  <input type="text" onChange={(e) => setFormData({ ...formData, name: e.target.value })} value={formData.name} placeholder='Enter Name....' className='pl-10 border-2 border-[#3F76AC] outline-none p-3 rounded-2xl w-full' />
                </div>
                <div className="relative w-full">
                  <MdEmail className='absolute top-1/2 left-4 -translate-y-1/2 text-[#3f76ac] text-xl' />
                  <input type="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} value={formData.email} placeholder='Enter Email....' className='pl-10 border-2 border-[#3F76AC] outline-none p-3 rounded-2xl w-full' />
                </div>
                <div className="relative w-full">
                  <TbLockPassword className='absolute top-1/2 left-4 -translate-y-1/2 text-[#3f76ac] text-xl' />
                  <input type={showicon ? "text" : "password"} onChange={(e) => setFormData({ ...formData, password: e.target.value })} value={formData.password} placeholder='Enter Password....' className='[&::-ms-reveal]:hidden [&::-ms-clear]:hidden border-2 border-[#3F76AC] outline-none p-3 rounded-2xl w-full pl-10' />
                  <TbPassword className='absolute top-1/2 right-4 -translate-y-1/2 text-[#3f76ac] text-xl' onClick={() => setShowIcon(!showicon)} />
                </div>
                
                <button className='w-full rounded-xl bg-[#3F76AC] p-3 text-white font-semibold cursor-pointer' >Submit</button>
              </form>
            </motion.div>}
        </div>
      </div>
    </>
  )
}

export default Login