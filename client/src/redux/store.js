import {configureStore} from '@reduxjs/toolkit';
import USerSlice from './USerSlice.js';


export default configureStore({
    reducer:{
        User:USerSlice.reducer
    }
})

