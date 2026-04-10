import React from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

const Chats = () => {
  return (
    <>
    <div>
    <Navbar />
    </div>
    <div className='w-full h-[calc(100vh-64px)] flex mt-16'>
    <Sidebar />
    </div>
    </>
  )
}

export default Chats