import axios from 'axios';
import React, { useEffect } from 'react'
import { IoIosLogOut } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


const Navbar = () => {
    const data = useSelector((state) => state.User.profilePicture);
    console.log("from Navbar.jsx", data);
    const navigate = useNavigate();

    const handleLogout = async () => {
        const data = await axios.get('http://localhost:8000/api/auth/logout', {
            withCredentials: true
        })
        const res = data.data;
        console.log(res);
        localStorage.removeItem('id');
        navigate('/login');
    }

    const profileUpdate = () => {
        navigate('/profile');
    }

    return (
        <div className='w-full h-14 bg-[#1e3448] flex justify-between items-center px-4 shadow-2xs shadow-blue-200 fixed top-0 left-0 z-50'>
            <div className="logo flex items-center gap-0 cursor-pointer" onClick={()=>navigate("/")}>
                <img src="/logo1.png" alt="" className='w-14 h-14 object-cover' />
                <span className='font-bold text-[24px] text-white -ml-2'>ippleRoom</span>
            </div>

            <div className="profile flex items-center gap-1">
                <img onClick={() => profileUpdate()} src={data} className='cursor-pointer h-10 w-10 object-cover rounded-full border-3 border-[#5d96d6e9]' />
                <div className="log text-[#e5ebf1e9] font-bold cursor-pointer h-14 w-14 rounded-full flex items-center justify-center " onClick={() => handleLogout()}>
                    <IoIosLogOut size={24} />
                </div>
            </div>


        </div>
    )
}

export default Navbar