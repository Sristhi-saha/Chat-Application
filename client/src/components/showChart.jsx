import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { IoIosAddCircle } from "react-icons/io";
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { useRef } from 'react';

const ShowChart = () => {

    const myuserId = useSelector((state) => state.User.userID);

    const [messages, setMessages] = useState([]);
    const [newSocket, setNewSocket] = useState(null);
    const [friends, setFriends] = useState([]);
    const [input, setInput] = useState('');
    const [selected, setSelected] = useState('');

    useEffect(() => {
        const newSocket = io('http://localhost:8000');
        setNewSocket(newSocket);
    }, [])

    useEffect(() => {
        if (newSocket && myuserId) {
            newSocket.emit('register', myuserId);
        }
        return () => { if (newSocket) newSocket.disconnect() };
    }, [myuserId, newSocket])

    const getFriends = async () => {
        const friends = await axios.get('http://localhost:8000/api/user/getFriends', {
            withCredentials: true
        });
        setFriends(friends.data.friends)
    }

    useEffect(() => {
        getFriends()
    }, [])

    const bottomRef = useRef();
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = () => {

    }

    return (
        // ✅ Fix 1: added overflow-hidden to root
        <div className="flex w-full h-screen overflow-hidden pt-16">

            {/* SIDEBAR */}
            <div className="pt-2 w-[360px] h-full bg-[#e8eff1] pr-3 ml-17 pl-2">
                <div className='text-black flex justify-between items-center'>
                    <h2 className='text-[18px] font-semibold pl-1'>Showchart</h2>
                    <IoIosAddCircle size={34} color='#6797ce' className='cursor-pointer' />
                </div>
                <div className="">
                    <input
                        type="text"
                        placeholder='Search or start new chat'
                        className='w-full mt-2 p-1 pl-4 bg-[#d3d6d6] rounded-xl'
                    />
                </div>
                <div>
                    <div className='mt-4 flex flex-col gap-2'>
                        {friends.map((e) => (
                            <div
                                key={e._id}
                                onClick={() => setSelected(e)}
                                className='bg-[#c3daee] p-2 rounded-xl flex items-center gap-1
                                        shadow-md hover:shadow-lg
                                        hover:bg-[#b5d1ea] hover:scale-[1.002]
                                        transition-all duration-200 cursor-pointer
                                        border border-white/40'>
                                <img
                                    src={e.profilePicture ? e.profilePicture : 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'}
                                    alt=""
                                    className='h-10 w-10 rounded-full'
                                />
                                <div className="flex ml-2">
                                    <p>{e.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CHAT COLUMN */}
            {/* ✅ Fix 2: removed h-screen, kept min-h-0 */}
            <div className="flex-1 flex flex-col h-full min-h-0 bg-[#f4f7fb]">

                {/* HEADER */}
                <div className="p-3 bg-white border-b flex items-center gap-3 shrink-0">
                   {selected? <img className='h-10 w-10 rounded-full' src={selected.profilePicture?selected.profilePicture:'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'} alt="" />:""}
                    <p className="font-semibold">
                        {selected ? selected.name : "Select a chat"}
                    </p>
                </div>

                {/* MESSAGES */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-[#eaf2f6]">
                    {messages.length === 0 ? (
                        <div className="text-gray-400 text-center mt-10">
                            No messages yet
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex mb-2 ${msg.from === myuserId ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`px-3 py-2 rounded-lg max-w-[60%] ${
                                        msg.from === myuserId
                                            ? "bg-[#32628b] text-white"
                                            : "bg-white"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* INPUT */}
                <div className="p-3 bg-white border-t flex gap-2 shrink-0">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 border rounded-lg p-2"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-[#6e9ccd] text-white hover:bg-[#4e87b5] transition-all cursor-pointer font-semibold px-6 rounded-lg shadow shadow-[#949090d6]"
                    >
                        Send
                    </button>
                </div>

            </div>
        </div>
    )
}

export default ShowChart