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

    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupMessages, setGroupMessages] = useState({});
    const [chatMode, setChatMode] = useState('private');

    useEffect(() => {
        const socket = io('http://localhost:8000');
        setNewSocket(socket);
        return () => socket.disconnect();
    }, [])

    useEffect(() => {
        if (newSocket && myuserId) newSocket.emit('register', myuserId);
    }, [myuserId, newSocket])

    useEffect(() => {
        const getFriends = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/user/getFriends', { withCredentials: true });
                setFriends(res.data.friends);
            } catch (err) { console.error('getFriends error:', err.response?.data); }
        }
        getFriends();
    }, [])

    useEffect(() => {
        const getGroups = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/group/getGroups', { withCredentials: true });
                const normalized = res.data.groups.map(g => ({
                    ...g,
                    groupId: g._id?.toString() || g.groupId?.toString()
                }));
                setGroups(normalized);
            } catch (err) { console.error('getGroups error:', err.response?.data); }
        }
        getGroups();
    }, [])

    useEffect(() => {
        if (!newSocket) return;
        newSocket.on("user_status", (data) => {
            setFriends(prev => prev.map(f => f._id === data.userId ? { ...f, isOnline: data.status === 'online', lastSeen: data.lastSeen || f.lastSeen } : f));
            setSelected(prev => prev?._id === data.userId ? { ...prev, isOnline: data.status === 'online', lastSeen: data.lastSeen || prev.lastSeen } : prev);
        });
        return () => newSocket.off("user_status");
    }, [newSocket]);

    useEffect(() => {
        if (!newSocket) return;
        newSocket.on("group_created", (group) => {
            setGroups(prev => [...prev, { ...group, groupId: group.groupId?.toString() }]);
        });
        newSocket.on("receive_group_message", (msg) => {
            const groupKey = msg.groupId?.toString();
            setGroupMessages(prev => ({
                ...prev,
                [groupKey]: [...(prev[groupKey] || []), {
                    from: msg.sender,
                    text: msg.content,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]
            }));
        });
        newSocket.on("member_joined", ({ groupId, userId }) => console.log(`User ${userId} joined group ${groupId}`));
        newSocket.on("member_left", ({ groupId, userId }) => console.log(`User ${userId} left group ${groupId}`));
        return () => {
            newSocket.off("group_created");
            newSocket.off("receive_group_message");
            newSocket.off("member_joined");
            newSocket.off("member_left");
        };
    }, [newSocket]);

    useEffect(() => {
        if (!newSocket) return;
        newSocket.on("receive_message", (msg) => {
            setMessages(prev => [...prev, { from: msg.sender, text: msg.content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        });
        return () => newSocket.off("receive_message");
    }, [newSocket]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, groupMessages])

    const getMessages = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/message/getMessages/${userId}`, { withCredentials: true });
            setMessages(res.data.data.map(msg => ({
                from: msg.sender, text: msg.content,
                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
        } catch (err) { console.error('getMessages error:', err.response?.data); }
    }

    const getGroupMessages = async (groupId) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/group/getGroupMessages/${groupId}`, { withCredentials: true });
            const formatted = res.data.data.map(msg => ({
                from: msg.sender._id, text: msg.content,
                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setGroupMessages(prev => ({ ...prev, [groupId]: formatted }));
        } catch (err) { console.error('getGroupMessages error:', err.response?.data); }
    }

    const toggleSelect = (friendId) => {
        setSelectedFriends(prev => prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]);
    }

    const handleSelectFriend = (friend) => {
        setSelected(friend);
        setSelectedGroup(null);
        setChatMode('private');
        setMessages([]);
        getMessages(friend._id);
    }

    const handleSelectGroup = (group) => {
        const normalizedGroup = { ...group, groupId: group.groupId?.toString() || group._id?.toString() };
        setSelectedGroup(normalizedGroup);
        setSelected(null);
        setChatMode('group');
        if (!groupMessages[normalizedGroup.groupId]) getGroupMessages(normalizedGroup.groupId);
    }

    const createGroup = () => {
        if (!groupName.trim() || selectedFriends.length === 0) return;
        newSocket.emit("create_group", { name: groupName, memberIds: [...selectedFriends, myuserId], createdBy: myuserId });
        setDialog(false);
        setGroupName('');
        setSelectedFriends([]);
    }

    const sendMessage = async () => {
        if (!input || !myuserId || !selected?._id) return;
        try {
            await axios.post('http://localhost:8000/api/message/sendMessage', { toUserId: selected._id, messages: input, fromUserId: myuserId, contentType: 'text' }, { withCredentials: true });
            setMessages(prev => [...prev, { from: myuserId, text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            newSocket.emit("private_message", { toUserId: selected._id, message: input, fromUserId: myuserId });
            setInput("");
        } catch (err) { console.error('Send failed:', err.response?.data); }
    }

    const sendGroupMessage = () => {
        if (!input.trim() || !selectedGroup?.groupId || !myuserId) return;
        newSocket.emit("send_group_message", { groupId: selectedGroup.groupId, message: input, fromUserId: myuserId });
        setInput("");
    }

    const currentMessages = chatMode === 'group'
        ? (groupMessages[selectedGroup?.groupId?.toString()] || [])
        : messages;

    const AVATAR_COLORS = ['#2e5878', '#1d6a5a', '#7a3a5a', '#4a5878', '#5a3a2e'];
    const getAvatarColor = (str = '') => AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];

    return (
        <div className="flex w-full h-screen overflow-hidden pt-16 ml-18 mt-0">

            {/* ── CREATE GROUP DIALOG ─────────────────────────────── */}
            {dialog && (
                <div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-[2px]"
                    onClick={() => { setDialog(false); setSelectedFriends([]); setGroupName(''); }}
                >
                    <div
                        className="bg-white rounded-2xl w-[420px] overflow-hidden"
                        style={{ boxShadow: '0 24px 48px rgba(30,52,72,0.18)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Dialog header */}
                        <div className="bg-[#1e3448] px-6 py-4">
                            <h2 className="text-white font-semibold text-[15px] tracking-tight">Create new group</h2>
                            <p className="text-[#7ab3d4] text-xs mt-0.5">Add a name and select members</p>
                        </div>

                        <div className="p-5">
                            <input
                                type="text"
                                value={groupName}
                                onChange={e => setGroupName(e.target.value)}
                                placeholder="Group name..."
                                className="w-full border border-[#c8d8e4] bg-[#f0f5f9] rounded-xl px-4 py-2.5 text-[13.5px] text-[#1a2e40] outline-none focus:border-[#4a7aab] mb-4 transition-colors"
                            />

                            {selectedFriends.length > 0 && (
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {selectedFriends.map(id => {
                                        const f = friends.find(f => f._id === id);
                                        return (
                                            <div key={id} className="flex items-center gap-1.5 bg-[#e2edf4] text-[#2e5878] text-xs px-3 py-1 rounded-full border border-[#c8d8e4]">
                                                <span className="font-medium">{f?.name}</span>
                                                <span onClick={() => toggleSelect(id)} className="cursor-pointer text-[#8aaabf] hover:text-[#c0392b] font-bold leading-none">×</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <p className="text-[10px] font-semibold text-[#8aaabf] uppercase tracking-wider mb-2">Select members</p>
                            <div className="flex gap-2 flex-col max-h-56 overflow-y-auto pr-1">
                                {friends.map(friend => (
                                    <div
                                        key={friend._id}
                                        onClick={() => toggleSelect(friend._id)}
                                        className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all border
                                            ${selectedFriends.includes(friend._id)
                                                ? 'border-[#4a7aab] bg-[#e8f0f8]'
                                                : 'border-[#e2edf4] bg-[#f7fafc] hover:bg-[#f0f5f9]'}`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={friend.profilePicture || 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'}
                                                alt=""
                                                className="h-9 w-9 rounded-full object-cover"
                                            />
                                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${friend.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-[#1a2e40]">{friend.name}</p>
                                            <p className="text-[11px] text-[#8aaabf] truncate">{friend.bio}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                            ${selectedFriends.includes(friend._id) ? 'bg-[#2e5878] border-[#2e5878]' : 'border-[#c8d8e4]'}`}>
                                            {selectedFriends.includes(friend._id) && (
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2.5 mt-5">
                                <button
                                    onClick={() => { setDialog(false); setSelectedFriends([]); setGroupName(''); }}
                                    className="flex-1 border border-[#c8d8e4] text-[#5a7a96] text-[13px] font-medium px-4 py-2.5 rounded-xl hover:bg-[#f0f5f9] cursor-pointer transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createGroup}
                                    disabled={selectedFriends.length === 0 || !groupName.trim()}
                                    className={`flex-1 text-white text-[13px] font-medium px-4 py-2.5 rounded-xl transition-all
                                        ${selectedFriends.length === 0 || !groupName.trim()
                                            ? 'bg-[#c8d8e4] cursor-not-allowed'
                                            : 'bg-[#1e3448] hover:bg-[#2e5878] cursor-pointer'}`}
                                >
                                    Create group {selectedFriends.length > 0 && `(${selectedFriends.length})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SIDEBAR ──────────────────────────────────────────── */}
            <div
                className="w-[300px] h-full flex flex-col flex-shrink-0 overflow-hidden"
                style={{ background: '#dce8f0', borderRight: '1px solid #c0d4e0' }}
            >
                {/* Sidebar header */}
                <div className="px-4 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-[15px] font-semibold text-[#1a2e40] tracking-tight">Showchat</h2>
                    <button
                        onClick={() => setDialog(true)}
                        className="w-7 h-7 rounded-lg bg-[#2e5878] flex items-center justify-center cursor-pointer hover:bg-[#1e3448] transition-colors"
                        aria-label="New group"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 2.5V11.5M2.5 7H11.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="px-3 pb-3 flex-shrink-0">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8aaabf]" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="6" cy="6" r="4.5" stroke="#8aaabf" strokeWidth="1.4"/>
                            <path d="M9.5 9.5L12 12" stroke="#8aaabf" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search or start new chat"
                            className="w-full bg-[#eaf2f6] border border-[#c0d4e0] rounded-xl pl-8 pr-3 py-2 text-[12.5px] text-[#1a2e40] outline-none placeholder:text-[#8aaabf] focus:border-[#4a7aab] transition-colors"
                        />
                    </div>
                </div>

                {/* Thread list */}
                <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#c0d4e0 transparent' }}>

                    {/* DMs */}
                    <p className="text-[10px] font-semibold text-[#7a9ab0] uppercase tracking-widest px-2 pt-2 pb-1.5">Direct messages</p>
                    {friends.map(e => (
                        <div
                            key={e._id}
                            onClick={() => handleSelectFriend(e)}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150
                                ${selected?._id === e._id && chatMode === 'private'
                                    ? 'bg-[#2e5878]'
                                    : 'hover:bg-[#cddde8]'}`}
                        >
                            <div className="relative flex-shrink-0">
                                <img
                                    src={e.profilePicture || 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'}
                                    alt=""
                                    className="h-9 w-9 rounded-full object-cover"
                                />
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2
                                    ${selected?._id === e._id && chatMode === 'private' ? 'border-[#2e5878]' : 'border-[#dce8f0]'}
                                    ${e.isOnline ? 'bg-green-500' : 'bg-[#b0c4d0]'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[13px] font-semibold truncate ${selected?._id === e._id && chatMode === 'private' ? 'text-white' : 'text-[#1a2e40]'}`}>
                                    {e.name}
                                </p>
                                <p className={`text-[11.5px] truncate ${selected?._id === e._id && chatMode === 'private' ? 'text-[#a8cce0]' : 'text-[#6a8a9e]'}`}>
                                    {e.lastMessage
                                        ? `${e.lastMessageSender === myuserId ? 'You: ' : ''}${e.lastMessage.length > 22 ? e.lastMessage.slice(0, 22) + '…' : e.lastMessage}`
                                        : 'No messages yet'}
                                </p>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                <p className={`text-[10.5px] ${selected?._id === e._id && chatMode === 'private' ? 'text-[#7ab3d4]' : 'text-[#8aaabf]'}`}>
                                    {e.lastMessageTime ? new Date(e.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Groups */}
                    <p className="text-[10px] font-semibold text-[#7a9ab0] uppercase tracking-widest px-2 pt-4 pb-1.5">Groups</p>
                    {groups.length === 0 ? (
                        <p className="text-[12px] text-[#8aaabf] px-2 py-1">No groups yet. Tap + to create one.</p>
                    ) : (
                        groups.map(group => (
                            <div
                                key={group.groupId}
                                onClick={() => handleSelectGroup(group)}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150
                                    ${selectedGroup?.groupId === group.groupId && chatMode === 'group'
                                        ? 'bg-[#2e5878]'
                                        : 'hover:bg-[#cddde8]'}`}
                            >
                                <div
                                    className="h-9 w-9 rounded-full flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0"
                                    style={{ background: getAvatarColor(group.name) }}
                                >
                                    {group.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[13px] font-semibold ${selectedGroup?.groupId === group.groupId && chatMode === 'group' ? 'text-white' : 'text-[#1a2e40]'}`}>
                                        {group.name}
                                    </p>
                                    <p className={`text-[11.5px] ${selectedGroup?.groupId === group.groupId && chatMode === 'group' ? 'text-[#a8cce0]' : 'text-[#6a8a9e]'}`}>
                                        {group.members?.length} members
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── CHAT COLUMN ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col h-full min-h-0" style={{ background: '#f4f8fb' }}>

                {/* Chat header */}
                <div className="px-5 py-3 bg-white flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid #dce8f0' }}>
                    {chatMode === 'group' && selectedGroup ? (
                        <>
                            <div
                                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-[14px] flex-shrink-0"
                                style={{ background: getAvatarColor(selectedGroup.name) }}
                            >
                                {selectedGroup.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-[14px] text-[#1a2e40]">{selectedGroup.name}</p>
                                <p className="text-[11.5px] text-[#8aaabf]">{selectedGroup.members?.length} members</p>
                            </div>
                        </>
                    ) : chatMode === 'private' && selected ? (
                        <>
                            <div className="relative flex-shrink-0">
                                <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={selected.profilePicture || 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'}
                                    alt=""
                                />
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${selected.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-[14px] text-[#1a2e40]">{selected.name}</p>
                                <p className={`text-[11.5px] font-medium ${selected.isOnline ? 'text-green-500' : 'text-[#8aaabf]'}`}>
                                    {selected.isOnline
                                        ? 'Online'
                                        : selected.lastSeen
                                            ? `Last seen ${new Date(selected.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            : 'Offline'}
                                </p>
                            </div>
                        </>
                    ) : (
                        <p className="text-[13.5px] text-[#8aaabf]">Select a conversation</p>
                    )}

                    {/* Header action icons */}
                    {(selected || selectedGroup) && (
                        <div className="flex gap-1 ml-auto">
                            {[
                                { icon: 'M11 3a8 8 0 110 16A8 8 0 0111 3zm0 14.4A6.4 6.4 0 1011 4.6a6.4 6.4 0 000 12.8zM9 9.5l5.5 3.5-5.5 3.5V9.5z', label: 'call', w: 22 },
                            ].map((_, i) => null)}
                            {['M3 5h18M3 12h18M3 19h18'].map((_, i) => (
                                <button key={i} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8aaabf] hover:bg-[#f0f5f9] hover:text-[#2e5878] transition-all cursor-pointer">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                                    </svg>
                                </button>
                            ))}
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8aaabf] hover:bg-[#f0f5f9] hover:text-[#2e5878] transition-all cursor-pointer">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                                </svg>
                            </button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8aaabf] hover:bg-[#f0f5f9] hover:text-[#2e5878] transition-all cursor-pointer">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div
                    className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-1"
                    style={{ background: '#eaf2f6', scrollbarWidth: 'thin', scrollbarColor: '#c0d4e0 transparent' }}
                >
                    {currentMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                            <div className="w-14 h-14 rounded-full bg-[#d0e4f0] flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6a9ab8" strokeWidth="1.5" strokeLinecap="round">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                                </svg>
                            </div>
                            <p className="text-[13px] text-[#8aaabf] font-medium">
                                {selected || selectedGroup ? 'No messages yet' : 'Select a chat to start messaging'}
                            </p>
                        </div>
                    ) : (
                        currentMessages.map((msg, i) => {
                            const isMe = msg.from === myuserId;
                            const prevMsg = currentMessages[i - 1];
                            const showAvatar = !isMe && msg.from !== prevMsg?.from;
                            return (
                                <div key={i} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${i > 0 && msg.from === prevMsg?.from ? 'mt-0.5' : 'mt-3'}`}>
                                    {/* Receiver avatar placeholder for alignment */}
                                    {!isMe && (
                                        <div className="w-7 h-7 flex-shrink-0">
                                            {showAvatar && (
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: '#5a8aaa' }}>
                                                    {(selected?.name || selectedGroup?.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className={`flex flex-col gap-0.5 max-w-[58%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        {chatMode === 'group' && !isMe && showAvatar && (
                                            <p className="text-[10px] text-[#4a7aab] font-semibold px-1">{msg.senderName || msg.from}</p>
                                        )}
                                        <div
                                            className={`px-3.5 py-2 text-[13.5px] leading-relaxed
                                                ${isMe
                                                    ? 'text-[#e8f4fc] rounded-2xl rounded-br-sm'
                                                    : 'text-[#1a2e40] bg-white rounded-2xl rounded-bl-sm border border-[#dce8f0]'}`}
                                            style={isMe ? { background: '#1e3448' } : {}}
                                        >
                                            {msg.text}
                                        </div>
                                        {msg.time && (
                                            <p className={`text-[10px] px-1 ${isMe ? 'text-[#8aaabf]' : 'text-[#8aaabf]'}`}>
                                                {msg.time}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 bg-white flex-shrink-0" style={{ borderTop: '1px solid #dce8f0' }}>
                    <div className="flex items-center gap-2.5 bg-[#f0f5f9] border border-[#c8d8e4] rounded-xl px-3 py-1.5">
                        {/* Emoji */}
                        <button className="text-[#8aaabf] hover:text-[#2e5878] transition-colors flex-shrink-0 cursor-pointer p-1 rounded-lg hover:bg-[#e2edf4]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                            </svg>
                        </button>
                        {/* Attach */}
                        <button className="text-[#8aaabf] hover:text-[#2e5878] transition-colors flex-shrink-0 cursor-pointer p-1 rounded-lg hover:bg-[#e2edf4]">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                            </svg>
                        </button>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (chatMode === 'group' ? sendGroupMessage() : sendMessage())}
                            className="flex-1 bg-transparent text-[13.5px] text-[#1a2e40] outline-none placeholder:text-[#9abacf]"
                            placeholder={
                                chatMode === 'group' && selectedGroup
                                    ? `Message ${selectedGroup.name}...`
                                    : selected
                                        ? `Message ${selected.name}...`
                                        : 'Select a chat...'
                            }
                            disabled={!selected && !selectedGroup}
                        />
                        <button
                            onClick={chatMode === 'group' ? sendGroupMessage : sendMessage}
                            disabled={!selected && !selectedGroup}
                            className={`flex-shrink-0 px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all cursor-pointer
                                ${!selected && !selectedGroup
                                    ? 'bg-[#c8d8e4] cursor-not-allowed'
                                    : 'bg-[#1e3448] hover:bg-[#2e5878]'}`}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShowChart;