import React, { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import ShowChart from '@/components/showChart'
import { io } from 'socket.io-client'

const Chats = () => {

  // const socket = io('http://localhost:8000');
  // useEffect(()=>{
  //   socket.emit('connection');
  // })


  return (
    <>
      <div className='flex flex-col h-screen overflow-hidden'>
        <Navbar />
      
      <div className='w-full flex h-[calc(100vh-64px)] mt-16 overflow-hidden'>
        <Sidebar />
        <ShowChart />
      </div>
      <div className="">

</div>
      </div>
    </>
  )
}

export default Chats