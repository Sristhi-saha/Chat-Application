import { createSlice } from "@reduxjs/toolkit";


const USerSlice = createSlice({
    name:"User",
    initialState:{
        user:null,
    },
    reducers:{
        setUser:(state,action)=>{
            state.user = action.payload;
        }
    }
})

export const {setUser} = USerSlice.actions;

export default USerSlice;

