import { createSlice } from '@reduxjs/toolkit'

export const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        addr: ''
    },
    reducers: {
        setWallet: (state, action) => {
            state.addr = action.payload;
        }
    },
})

export const { setWallet } = walletSlice.actions

export default walletSlice.reducer;