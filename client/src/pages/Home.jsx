import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const id = localStorage.getItem("id");
  const navigate = useNavigate();
  useEffect(()=>{
    if(!id){
      navigate('/login');
    }
  },[]) 
  return (
   <>
   <div>
    <Navbar />
   </div>
   </>
  )
}

export default Home