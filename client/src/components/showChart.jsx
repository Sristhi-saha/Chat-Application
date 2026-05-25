import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react'
import { IoIosAddCircle } from "react-icons/io";
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const ShowChart = () => {

    const myuserId = useSelector((state) => state.User.userID);

    const [messages, setMessages] = useState([]);
    const [newSocket, setNewSocket] = useState(null);
    const [friends, setFriends] = useState([]);
    const [input, setInput] = useState('');
    const [selected, setSelected] = useState(null);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [dialog, setDialog] = useState(false);
    const bottomRef = useRef();

    // Socket init
    useEffect(() => {
        const socket = io('http://localhost:8000');
        setNewSocket(socket);
        return () => socket.disconnect();
    }, [])

    // Register user on socket
    useEffect(() => {
        if (newSocket && myuserId) {
            newSocket.emit('register', myuserId);
        }
    }, [myuserId, newSocket])

    // Get friends
    useEffect(() => {
        const getFriends = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/user/getFriends', {
                    withCredentials: true
                });
                setFriends(res.data.friends);
            } catch (err) {
                console.error('getFriends error:', err.response?.data);
            }
        }
        getFriends();
    }, [])

    // ✅ Fix 1 — user_status in its own useEffect with newSocket dependency
    useEffect(() => {
        if (!newSocket) return;

        newSocket.on("user_status", (data) => {
            setFriends(prev => prev.map(friend => {
                if (friend._id === data.userId) {
                    return {
                        ...friend,
                        isOnline: data.status === 'online',
                        lastSeen: data.lastSeen || friend.lastSeen
                    };
                }
                return friend;
            }));

            setSelected(prev => {
                if (prev?._id === data.userId) {
                    return {
                        ...prev,
                        isOnline: data.status === 'online',
                        lastSeen: data.lastSeen || prev.lastSeen
                    };
                }
                return prev;
            });
        });

        return () => newSocket.off("user_status");
    }, [newSocket]);

    // Auto scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Fetch chat history
    const getMessages = async (userId) => {
        try {
            const res = await axios.get(
                `http://localhost:8000/api/message/getMessages/${userId}`,
                { withCredentials: true }
            );
            const formatted = res.data.data.map((msg) => ({
                from: msg.sender,
                text: msg.content,
                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setMessages(formatted);
        } catch (err) {
            console.error('getMessages error:', err.response?.data);
        }
    }

    const toggleSelect = (friendId) => {
        setSelectedFriends(prev => 
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        )
    }

    // Select friend and load messages
    const handleSelectFriend = (friend) => {
        setSelected(friend);
        setMessages([]);
        getMessages(friend._id);
    }

    // Send message
    const sendMessage = async () => {
        if (!input || !myuserId || !selected?._id) return;

        try {
            await axios.post(
                'http://localhost:8000/api/message/sendMessage',
                {
                    toUserId: selected._id,
                    messages: input,
                    fromUserId: myuserId,
                    contentType: 'text'
                },
                { withCredentials: true }
            );

            setMessages(prev => [...prev, {
                from: myuserId,
                text: input,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            newSocket.emit("private_message", {
                toUserId: selected._id,
                message: input,
                fromUserId: myuserId
            });

            setInput("");

        } catch (err) {
            console.error('Send failed:', err.response?.data);
        }
    }

    // Receive incoming messages
    useEffect(() => {
        if (!newSocket) return;

        newSocket.on("receive_message", (msg) => {
            setMessages(prev => [...prev, {
                from: msg.sender,
                text: msg.content,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // ✅ Fix 3
            }]);
        });

        return () => newSocket.off("receive_message");
    }, [newSocket]);

    return (
        <div className="flex w-full h-screen overflow-hidden pt-16">

          {dialog && (
    <div
        className='absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-10'
        onClick={() => {setDialog(false) ,setSelectedFriends([]);}}
    >
        <div
            className='bg-white p-6 rounded-lg w-[400px]'
            onClick={(e) => e.stopPropagation()}
        >
            <h2 className='text-lg font-semibold mb-4'>Create Group</h2>
            <input
                type="text"
                placeholder='Group name...'
                className='w-full border-2 border-[#3d7ba1] p-2 rounded-2xl pl-4 mb-3'
            />

            {/* Selected tags */}
            {selectedFriends.length > 0 && (
                <div className='flex gap-2 mb-3 flex-wrap'>
                    {selectedFriends.map(id => {
                        const f = friends.find(f => f._id === id);
                        return (
                            <div key={id} className='flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full'>
                                <span>{f?.name}</span>
                                <span onClick={() => toggleSelect(id)} className='cursor-pointer font-bold hover:text-red-500'>×</span>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ✅ friends.map() added, friend variable renamed to avoid conflict */}
            <div className='flex gap-2 flex-col max-h-60 overflow-y-auto'>
                {friends.map((friend) => (  // ← "friend" not "e" to avoid conflict
                    <div
                        key={friend._id}
                        onClick={() => toggleSelect(friend._id)}  // ← no event parameter
                        className={`p-2 rounded-2xl flex items-center gap-2 cursor-pointer transition-all
                            ${selectedFriends.includes(friend._id)
                                ? 'border-2 border-blue-400 bg-blue-50'
                                : 'border-2 border-blue-100'
                            }`}
                    >
                        <div className="relative flex-shrink-0">
                            <img
                                src={friend.profilePicture || 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'}
                                alt=""
                                className='h-10 w-10 rounded-full object-cover'
                            />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                                ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className='text-[14px] font-semibold text-gray-700'>{friend.name}</p>
                            <p className="text-xs text-gray-500 truncate">{friend.bio}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                            ${selectedFriends.includes(friend._id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}
                        >
                            {selectedFriends.includes(friend._id) && (
                                <span className='text-white text-xs'>✓</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className='flex gap-2 mt-4'>
                <button
                    onClick={() => { setDialog(false); setSelectedFriends([]); }}
                    className='flex-1 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer'
                >
                    Cancel
                </button>
                <button
                    disabled={selectedFriends.length === 0}
                    className={`flex-1 text-white px-4 py-2 rounded-lg
                        ${selectedFriends.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#6797ce] hover:bg-[#4e87b5] cursor-pointer'}`}
                >
                    Create ({selectedFriends.length})
                </button>
            </div>
        </div>
    </div>
)}

            {/* SIDEBAR */}
            <div className="pt-2 w-[360px] h-full bg-[#e8eff1] pr-3 ml-17 pl-2">
                <div className='text-black flex justify-between items-center'>
                    <h2 className='text-[18px] font-semibold pl-1'>Showchart</h2>
                    <IoIosAddCircle onClick={() => setDialog(true)} size={34} color='#6797ce' className='cursor-pointer' />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder='Search or start new chat'
                        className='w-full mt-2 p-1 pl-4 bg-[#d3d6d6] rounded-xl'
                    />
                </div>
                <div className='mt-4 flex flex-col gap-2'>
                    {friends.map((e) => (
                        <div
                            key={e._id}
                            onClick={() => handleSelectFriend(e)}
                            className={`p-2 rounded-xl flex items-center gap-2 shadow-md
                                hover:bg-[#b5d1ea] transition-all duration-200
                                cursor-pointer border border-white/40
                                ${selected?._id === e._id ? 'bg-[#a8c8e8]' : 'bg-[#c3daee]'}`}
                        >
                            {/* Avatar with online dot */}
                            <div className="relative flex-shrink-0">
                                <img
                                    src={e.profilePicture || 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'}
                                    alt=""
                                    className='h-10 w-10 rounded-full object-cover'
                                />
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                                    ${e.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                                />
                            </div>

                            {/* Name + last message */}
                            <div className="flex-1 min-w-0">
                                <p className='text-[14px] font-semibold text-gray-700'>{e.name}</p>
                                <p className="text-xs text-gray-500 truncate">
                                    {e.lastMessage
                                        ? `${e.lastMessageSender === myuserId ? 'You: ' : e.name + ': '}${e.lastMessage.length > 20 ? e.lastMessage.slice(0, 20) + '...' : e.lastMessage}`
                                        : 'No messages yet'
                                    }
                                </p>
                            </div>

                            {/* ✅ Fix 2 — only show time if lastMessageTime exists */}
                            <div className="flex-shrink-0 text-right">
                                <p className="text-xs text-gray-400">
                                    {e.lastMessageTime
                                        ? new Date(e.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : ''
                                    }
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CHAT COLUMN */}
            <div className="flex-1 flex flex-col h-full min-h-0 bg-[#f4f7fb]">

                {/* HEADER */}
                <div className="p-3 bg-white border-b flex items-center gap-3 shrink-0">
                    {selected && (
                        <div className="relative">
                            <img
                                className='h-10 w-10 rounded-full object-cover'
                                src={selected.profilePicture || 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'}
                                alt=""
                            />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                                ${selected.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <p className="font-semibold">
                            {selected ? selected.name : "Select a chat"}
                        </p>
                        {selected && (
                            <p className={`text-xs ${selected.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                {selected.isOnline
                                    ? 'Online'
                                    : selected.lastSeen
                                        ? `Last seen ${new Date(selected.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                        : 'Offline'
                                }
                            </p>
                        )}
                    </div>
                </div>

                {/* MESSAGES */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-[#eaf2f6]">
                    {messages.length === 0 ? (
                        <div className="text-gray-400 text-center mt-10">
                            {selected ? 'No messages yet' : 'Select a chat to start messaging'}
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex mb-2 ${msg.from === myuserId ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`px-3 py-2 rounded-lg max-w-[60%] ${msg.from === myuserId
                                    ? "bg-[#32628b] text-white"
                                    : "bg-white"
                                    }`}>
                                    <p className="text-sm">{msg.text}</p>
                                    {msg.time && (
                                        <p className={`text-[10px] mt-1 text-right ${msg.from === myuserId ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </p>
                                    )}
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
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
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