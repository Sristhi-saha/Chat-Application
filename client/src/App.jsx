import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { Routes ,Route} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Chats from './pages/Chats'
import './App.css'

function App() {
  
  return (
    <>
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route  path='/login' element={<Login />}/>
      <Route path='/chats' element={<Chats />} />
    </Routes>
    </>
     )
}

export default App
