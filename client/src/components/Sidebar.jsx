import React, { useEffect, useState } from 'react'
import { BsChatSquareDotsFill } from "react-icons/bs";
import { IoHome } from "react-icons/io5";
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  
  const location = useLocation();
  const [selected,setSelected] = useState(); 
  const navigate = useNavigate(); 
  useEffect(()=>{
    if(location.pathname=='/'){
    setSelected('home');
  }else if(location.pathname=='/chats'){
    setSelected('chats');
  } 
  },[location.pathname])
  return (
   <>
   <div className="bg-[#9ab5d4] w-[70px] h-full shadow-2xs p-4 fixed">
    <div className="flex items-center justify-center mt-10 flex-col gap-6">
        <div className={`bg-[#f3f5f97b] w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer ${selected ==='home' && 'bg-[#fefafab8] border-2 border-[#3d7ba1] flex items-center h-10 w-10'}`} onClick={()=>navigate('/')}>
            <IoHome size={20} className='text-[#3367a2e9]'/>
        </div>
         <div className={`bg-[#f3f5f97b] w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer ${selected==='chats' && 'bg-[#fdfafab8] border-2 border-[#3d7ba1] flex items-center h-10 w-10'}`} onClick={()=>navigate('/chats')}>
            <BsChatSquareDotsFill size={20} className='text-[#3367a2e9]'/>
        </div>
        
    </div>
   </div>
   </>
  )
}

export default Sidebar