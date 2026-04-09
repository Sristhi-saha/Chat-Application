import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Chats from './pages/Chats'
import Profile from './pages/Profile'
import { useSelector } from 'react-redux'
import './App.css'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUserID } from './redux/USerSlice'


function App() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.User.userID);
  console.log("from App.jsx", data);
  useEffect(() => {
    const id = localStorage.getItem('id');
    if (id) {
      dispatch(setUserID(id));
    }

  }, [])

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/chats' element={<Chats />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </>
  )
}

export default App
