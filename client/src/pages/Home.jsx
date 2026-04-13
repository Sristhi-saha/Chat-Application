import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom';
import { IoMdSearch } from "react-icons/io";
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const Home = () => {
  const id = localStorage.getItem("id");
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [buttonText, setButtonText] = useState([]);
  const [requestSend,setRequestSend] = useState([]);

  const getAll = async () => {
    const res = await axios.get('http://localhost:8000/api/user/all', {
      withCredentials: true
    })
    const data = res.data.user;
    console.log(data);
    setUsers(data);

  }

  const requestSendBy = async()=>{
    const res = await axios.get('http://localhost:8000/api/user/requestSendBy',{
      withCredentials:true
    });
    setRequestSend(res.data.data.requestSendBy)
  }

  const addFriend=async(id)=>{
    const res = await axios.post('http://localhost:8000/api/user/acceptRequest',{sendId:id},{
      withCredentials:true
    })
    if(res.status){
      requestSendBy();
    }
  }

  const sendRequest = async (id) => {
    console.log(id);
    const res = await axios.post('http://localhost:8000/api/user/requestSend', { receiveId: id }, {
      withCredentials: true
    });
    console.log(res);
    if (res.data.success) {
      setButtonText(id)
    }
  }

  useEffect(() => {
    if (!id) {
      navigate('/login');
    }
    getAll();
    requestSendBy();
  }, [])
  return (
    <>
      <div>
        <div>
          <Navbar />
        </div>
        <div className='w-full h-[calc(100vh-64px)] flex mt-16'>
          <Sidebar />
          <div className="m-6 w-full mr-10 ml-24">
            <div className="w-full relative">
              <IoMdSearch size={20} className='absolute left-3 top-3 translate- text-[gray]' />
              <input type="text" placeholder='Search People....' className='w-[100%] border-2 border-[#3d7ba1] p-2 rounded-2xl pl-8' />
            </div>
            {/* {friend section} */}
            <div className="mt-10">
              <div className="">
                <div className="w-[154px] border-2 border-gray-400 pl-3 pr-2 text-gray-600 rounded-4xl ">Request Send By</div>
                <div className="flex gap-10 mt-6 overflow-hidden flex-wrap">
                  {
                    requestSend.map((value, key) => (
                      <div className="w-[260px] p-4 border-2 border-blue-100 rounded-2xl">
                        <div className="flex justify-center items-center flex-col">
                          <img src={value.profilePicture ? value.profilePicture : 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'} alt="" className='w-20 h-20 rounded-full flex  items-center justify-center' />
                          <h2 className='text-[22px] font-bold'>{value.name}</h2>
                          <p className='text-[18px] font-semibold text-gray-600'>{value.bio}</p>
                          <button onClick={() => { addFriend(value._id) }} className='mt-4 w-full bg-[#587ab1] p-2 text-white font-bold rounded-2xl hover:bg-[#30599c] transition-colors cursor-pointer'>
                            {value.requestSendBy.includes(id) || buttonText.includes(value._id) ? 'Request send' : 'Accept Request'}</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            {/* frined request section */}
            <div className="mt-10">
              <div className="">
                <div className="w-[90px] border-2 border-gray-400 pl-3 pr-2 text-gray-600 rounded-4xl ">All Users</div>
                <div className="flex gap-10 mt-6 overflow-hidden flex-wrap">
                  {
                    users.map((value, key) => (
                      <div className="w-[260px] p-4 border-2 border-blue-100 rounded-2xl">
                        <div className="flex justify-center items-center flex-col">
                          <img src={value.profilePicture ? value.profilePicture : 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'} alt="" className='w-20 h-20 rounded-full flex  items-center justify-center' />
                          <h2 className='text-[22px] font-bold'>{value.name}</h2>
                          <p className='text-[18px] font-semibold text-gray-600'>{value.bio}</p>
                          <button onClick={() => { sendRequest(value._id) }} className='mt-4 w-full bg-[#587ab1] p-2 text-white font-bold rounded-2xl hover:bg-[#30599c] transition-colors cursor-pointer'>
                            {value.requestSendBy.includes(id) || buttonText.includes(value._id) ? 'Request send' : 'Add Friend'}</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            {/* all people */}
          </div>
        </div>

      </div>
    </>
  )
}

export default Home