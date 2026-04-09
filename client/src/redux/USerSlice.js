import { createSlice } from "@reduxjs/toolkit";


const USerSlice = createSlice({
    name:"User",
    initialState:{
        userID:null,
        profilePicture:null,
        name:null,
        bio:null
    },
    reducers:{
        setUserID:(state,action)=>{
            state.userID = action.payload;
        },
        setProfilePicture:(state,action)=>{
            state.profilePicture = action.payload;
        },
        setName:(state,action)=>{
            state.name = action.payload;
        },
        setBio:(state,action)=>{
            state.bio = action.payload;
        }    
    }
})

export const {setUserID,setProfilePicture,setName,setBio} = USerSlice.actions;

export default USerSlice;

