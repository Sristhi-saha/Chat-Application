import React from 'react'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdEmail } from "react-icons/md";
import { useRef } from 'react';
import { MdLock } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { TbLockPassword } from "react-icons/tb";
import { TbPassword } from "react-icons/tb";


const Login = () => {
  const [isLogin, setIsLogin] = useState(false);
  const fileRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    });
  const [showicon,setShowIcon] = useState(false);  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setFormData({
      name: '',
      email: '',
      password: '',
    })
    fileRef.current.value = null;
  }
  const handleButtonClick = ()=>{
    setIsLogin(!isLogin)
  }
  return (
    <>
      <div className="w-full h-screen flex items-center justify-center bg-[#e1dbdb] p-8">
        <div className='shadow-2xl relative overflow-hidden shadow shadow-blue-100 w-[800px] h-[600px] rounded-lg m-10 flex items-center justify-center'>
          <motion.div
          animate={{x:isLogin?400:0}}
          transition={{type:'spring', stiffness: 100}}
           className={`bg-[#3f76ac]  h-full ${!isLogin?"rounded-l-lg":"rounded-r-lg"} flex items-center justify-center flex-col w-1/2`}>
            <h1 className='text-3xl text-white font-bold'>Welcome To {isLogin?"Login":"Register"}</h1>
            <p className='text-[18px] text-[#f2ebeb]'>Fast, secure, and easy messaging starts here.</p>
            <button onClick={()=>handleButtonClick()} className='w-45 bg-white mt-5 p-2 text-[#3F76AC] font-semibold rounded-xs text-xl cursor-pointer'>{isLogin?"Register":"Login"}</button>
          </motion.div>
          {isLogin?
          <motion.div
          animate={{x:isLogin?-400:0}}
          transition={{type:'spring', stiffness: 100}}
           className={`bg-white w-1/2 h-full flex items-center justify-center ${!isLogin?"rounded-r-lg":"rounded-l-lg"}`}>
            <form className='flex flex-col justify-center items-center gap-5 w-3/4' onSubmit={(e) => handleSubmit(e)}>
  <h1 className='text-4xl text-[#3F76AC] font-semibold'>Sign In</h1>

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

  <span className='text-red-400 hover:underline text-sm cursor-pointer' style={{ marginTop: "-10px" ,marginBottom:"-10px"}}>
    Forgot Password?
  </span>

  <button className='w-full rounded-xl bg-[#3F76AC] p-3 text-white font-semibold cursor-pointer'>
    Submit
  </button>
</form>
          </motion.div>:<motion.div
          animate={{x:isLogin?-400:0}}
          transition={{type:'spring', stiffness: 100}}
           className="bg-white w-1/2 h-full flex items-center justify-center rounded-r-lg ">
            <form className='flex flex-col justify-center items-center gap-5 w-3/4' onSubmit={(e) => handleSubmit(e)}>
              <h1 className='text-3xl text-[#3F76AC] font-semibold'>Sign Up</h1>
              <div className="relative w-full">
                <IoPerson className='absolute top-1/2 left-4 -translate-y-1/2 text-[#3f76ac] text-xl'/>
                <input type="text" onChange={(e) => setFormData({ ...formData, name: e.target.value })} value={formData.name} placeholder='Enter Name....' className='pl-10 border-2 border-[#3F76AC] outline-none p-3 rounded-2xl w-full' />
              </div>
              <div className="relative w-full">
                <MdEmail className='absolute top-1/2 left-4 -translate-y-1/2 text-[#3f76ac] text-xl'/>
              <input type="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} value={formData.email} placeholder='Enter Email....' className='pl-10 border-2 border-[#3F76AC] outline-none p-3 rounded-2xl w-full' />
              </div>
              <div className="relative w-full">
                <TbLockPassword className='absolute top-1/2 left-4 -translate-y-1/2 text-[#3f76ac] text-xl'/>
              <input type={showicon?"text":"password"} onChange={(e) => setFormData({ ...formData, password: e.target.value })} value={formData.password} placeholder='Enter Password....' className='[&::-ms-reveal]:hidden [&::-ms-clear]:hidden border-2 border-[#3F76AC] outline-none p-3 rounded-2xl w-full pl-10' />
              <TbPassword className='absolute top-1/2 right-4 -translate-y-1/2 text-[#3f76ac] text-xl'onClick={()=>setShowIcon(!showicon)} />
              </div>
              <input type="file" ref={fileRef} onChange={(e) => setFormData({ ...formData, profilePicture: e.target.files[0] })} className='border-2 border-[#3F76AC] outline-none border-dashed p-2 rounded-2xl w-full' />
              <button className='w-full rounded-xl bg-[#3F76AC] p-3 text-white font-semibold cursor-pointer' >Submit</button>
            </form>
          </motion.div>}
        </div>
      </div>
    </>
  )
}

export default Login