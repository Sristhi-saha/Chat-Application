import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom';
import { IoMdSearch } from "react-icons/io";
import { FiUserPlus, FiUserCheck, FiUserX } from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi2";
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg';

const Home = () => {
  const id = localStorage.getItem("id");
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [buttonText, setButtonText] = useState([]);
  const [requestSend, setRequestSend] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const getAll = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get('http://localhost:8000/api/user/all', {
        withCredentials: true
      })
      setUsers(res.data.user);
    } finally {
      setLoadingUsers(false);
    }
  }

  const requestSendBy = async () => {
    setLoadingRequests(true);
    try {
      const res = await axios.get('http://localhost:8000/api/user/requestSendBy', {
        withCredentials: true
      });
      setRequestSend(res.data.data.requestSendBy);
    } finally {
      setLoadingRequests(false);
    }
  }

  const addFriend = async (id) => {
    const res = await axios.post('http://localhost:8000/api/user/acceptRequest', { sendId: id }, {
      withCredentials: true
    })
    if (res.status) {
      requestSendBy();
    }
  }

  const removeFriend = async (id) => {
    const res = await axios.post('http://localhost:8000/api/user/rejectRequest', { sendId: id }, {
      withCredentials: true
    })
    if (res.status) {
      requestSendBy();
    }
  }

  const sendRequest = async (id) => {
    const res = await axios.post('http://localhost:8000/api/user/requestSend', { receiveId: id }, {
      withCredentials: true
    });
    if (res.data.success) {
      setButtonText((prev) => [...prev, id])
    }
  }

  useEffect(() => {
    if (!id) {
      navigate('/login');
      return;
    }
    getAll();
    requestSendBy();
  }, [])

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const CardSkeleton = () => (
    <div className="w-[260px] p-5 border border-gray-200 rounded-2xl animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-gray-200" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-200 rounded" />
        <div className="h-9 w-full bg-gray-200 rounded-xl mt-2" />
      </div>
    </div>
  );

  const EmptyState = ({ icon, text }) => (
    <div className="flex flex-col items-center justify-center w-full py-10 text-gray-400 gap-2">
      {icon}
      <p className="text-[15px] font-medium">{text}</p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen bg-[radial-gradient(#689cc9_1px,transparent_1px)] [background-size:20px_20px]">
  <Navbar />
  <div className="w-full flex mt-16"> {/* no bg-* here */}
    <Sidebar /> {/* check Sidebar.jsx for bg-white */}
    <div className="m-6 w-full mr-10 ml-24 max-w-6xl"> {/* no bg-* here either, or use bg-transparent */}
          {/* Search bar */}
          <div className="w-full relative">
            <IoMdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people..."
              className="w-full bg-white border border-gray-200 p-3 rounded-2xl pl-10 text-[15px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3d7ba1]/40 focus:border-[#3d7ba1] transition"
            />
          </div>

          {/* Friend requests section */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-4 py-1.5 bg-blue-50 text-[#30599c] text-sm font-semibold rounded-full border border-blue-100">
                Friend Requests
              </span>
              {requestSend.length > 0 && (
                <span className="text-sm text-gray-400">({requestSend.length})</span>
              )}
            </div>

            <div className="flex gap-6 flex-wrap">
              {loadingRequests ? (
                <>
                  <CardSkeleton /><CardSkeleton /><CardSkeleton />
                </>
              ) : requestSend.length > 0 ? (
                requestSend.map((value) => (
                  <div
                    key={value._id}
                    className="w-[320px] p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={value.profilePicture || DEFAULT_AVATAR}
                        alt={value.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                      />
                      <h2 className="text-[18px] font-bold mt-3 text-gray-800">{value.name}</h2>
                      <p className="text-[14px] text-gray-500 line-clamp-2 mt-1">{value.bio}</p>

                      <div className="flex gap-3 w-full mt-4">
                        <button
                          onClick={() => addFriend(value._id)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-[#3d7ba1] hover:bg-[#30599c] text-white text-sm font-semibold py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          <FiUserCheck size={16} /> Accept
                        </button>
                        <button
                          onClick={() => removeFriend(value._id)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-500 text-sm font-semibold py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          <FiUserX size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon={<HiOutlineUsers size={32} />} text="No pending requests" />
              )}
            </div>
          </div>

          {/* All users section */}
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full border border-gray-200">
                All Users
              </span>
              {!loadingUsers && (
                <span className="text-sm text-gray-400">({filteredUsers.length})</span>
              )}
            </div>

            <div className="flex gap-6 flex-wrap justify-center">
              {loadingUsers ? (
                <>
                  <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
                </>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((value) => {
                  const alreadyRequested = value.requestSendBy?.includes(id) || buttonText.includes(value._id);
                  return (
                    <div
                      key={value._id}
                      className="w-[320px] p-5 bg-[#cdd7e4] border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col items-center text-center">
                        <img
                          src={value.profilePicture || DEFAULT_AVATAR}
                          alt={value.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                        />
                        <h2 className="text-[18px] font-bold mt-3 text-gray-800">{value.name}</h2>
                        <p className="text-[14px] text-gray-500 line-clamp-2 mt-1">{value.bio}</p>

                        <button
                          onClick={() => sendRequest(value._id)}
                          disabled={alreadyRequested}
                          className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer
                            ${alreadyRequested
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#3d7ba1] hover:bg-[#30599c] text-white'}`}
                        >
                          {alreadyRequested ? <FiUserCheck size={16} /> : <FiUserPlus size={16} />}
                          {alreadyRequested ? 'Request Sent' : 'Add Friend'}
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <EmptyState icon={<HiOutlineUsers size={32} />} text="No users found" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home