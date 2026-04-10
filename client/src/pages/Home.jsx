import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom';
import { IoMdSearch } from "react-icons/io";
import Sidebar from '../components/Sidebar';

const Home = () => {
  const id = localStorage.getItem("id");
  const navigate = useNavigate();
  useEffect(() => {
    if (!id) {
      navigate('/login');
    }
  }, [])
  return (
    <>
      <div>
        <div>
          <Navbar />
        </div>
        <div className='w-full h-[calc(100vh-64px)] flex mt-16'>
          <Sidebar />
          <div className="m-6 w-full ml-10 mr-10">
            <div className="w-full relative">
              <IoMdSearch size={20} className='absolute left-3 top-3 translate- text-[gray]' />
              <input type="text" placeholder='Search People....' className='w-[100%] border-2 border-[#3d7ba1] p-2 rounded-2xl pl-8' />
            </div>
            {/* frined request section */}
            <div className="">
              
            </div>
            {/* all people */}
          </div>
        </div>

      </div>
    </>
  )
}

export default Home