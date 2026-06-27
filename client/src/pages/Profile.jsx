import React, { useEffect } from 'react'
import { MdLock } from "react-icons/md";
import { MdUpload } from "react-icons/md";
import { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setUserID,setProfilePicture ,setName,setBio} from '../redux/USerSlice';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';


const Profile = () => {
    const userProfile = useSelector((state) => state.User.profilePicture);
    const name = useSelector((state)=>state.User.name);
    const bio = useSelector((state)=>state.User.bio);
    const user = useSelector((state) => state.User);
    console.log("from Profile.jsx", user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    console.log("from redux :",user);
    useEffect(() => {
        const id = localStorage.getItem('id');
        console.log("id from localStorage:", id);
        if (!id) {
            navigate('/login');
        } else {
            dispatch(setUserID(id));
            console.log("dispatched!")  
        }
    }, [])

    const fileRef = useRef(null);
    const [formData, setFormData] = React.useState({
        name: '',
        bio: '',
        profilePicture: null,
    });
    const handleFileChange = (e) => {

        const file = e.target.files[0];
        setFormData({ ...formData, profilePicture: file });
        

    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const form = new FormData()
        form.append('name', formData.name)
        form.append('bio', formData.bio)
        form.append('profilePicture', formData.profilePicture)
        console.log(form);
        const res = await axios.post("http://localhost:8000/api/auth/profile", form, {
            withCredentials: true
        })
        console.log("user profile",res)
        const data = res.data;
        console.log(data.user.profilePicture);
        dispatch(setProfilePicture(data.user.profilePicture));
        dispatch(setName(data.user.name));
        dispatch(setBio(data.user.bio));
        navigate('/');
        if(res){
            setFormData({
                name:'',
                bio:'',
            })
        }
        fileRef.current.value='';
    }

    return (
       <div className='bg-gray-50 min-h-screen bg-[radial-gradient(#689cc9_1px,transparent_1px)] [background-size:20px_20px]'>
        <Navbar />
        <div className='w-full h-[calc(100vh-64px)] flex mt-16'>
            <Sidebar />
            <div className='flex-1 flex items-center justify-center p-12'>
                <div className='w-[460px] h-[500px] relative bg-[#c8d9ef94] rounded-lg shadow-lg flex items-center justify-center flex-col gap-5'>
           
                <div className="rounded-t-lg rounded-b-[80%] p-18 bg-[#2c4760] w-full h-1/4 absolute top-0 flex items-center justify-center">
                    <img src={userProfile?userProfile:'https://img.freepik.com/premium-vector/blue-sign-with-persons-face-blue-circle-with-white-background_136558-83302.jpg'} alt="" className='rounded-full object-cover object-center w-24 h-24 border-4' />
                </div>
                <div className="flex flex-col justify-center items-center w-full gap-5 mt-24 p-10 ">
                    <form className='gap-4 flex flex-col justify-center w-full' onSubmit={(e) => handleSubmit(e)}>
                        <input type="text" onChange={(e) => setFormData({ ...formData, name: e.target.value })} value={formData.name} placeholder={name?name:'John Doe'} className='focus:none border-2 border-[#15273d] p-2 pl-3 shadow shadow-[#abc7dc99] outline-none rounded-full w-full' />
                        <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder={bio?bio:'Currently Now....'} className='focus:none border-2 border-[#102844] p-2 pl-3 shadow shadow-[#abc7dc99] outline-none rounded-3xl w-full resize-none' />
                        <label className='border-2 border-dashed border-[#172e45] p-3 rounded-2xl w-full cursor-pointer text-center text-[#192d41] hover:bg-[#3f76ac15] transition-all duration-200 flex items-center justify-center gap-2'>
                            <MdUpload className='text-xl' />
                            <span>{formData.profilePicture ? "Uploaded" : "Upload Profile Picture"}</span>
                            <input
                                type="file"
                                ref={fileRef}
                                onChange={(e) => handleFileChange(e)}
                                className='hidden'
                            />
                        </label>
                        <button className='w-full bg-[#2c4760] p-3 rounded-3xl font-semibold text-white shadow shadow-blue-300 hover:bg-[#33597e] hover:shadow-blue-400 mt-2git cursor-pointer'>Save Changes</button>
                    </form>
                </div>
            </div>

        </div>
        </div>
        </div>
    )
}

export default Profile