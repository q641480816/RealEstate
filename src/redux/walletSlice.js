import { createSlice } from '@reduxjs/toolkit'

export const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        addr: '',
        myOrders: [],
        assetBalances: [],
        sgdBalance: "0.00",
        reload: false
    },
    reducers: {
        setWallet: (state, action) => {
            state.addr = action.payload;
        },
        setMyOrders: (state, action) => {
            state.myOrders = action.payload
        },
        setAssetBalances: (state, action) => {
            state.assetBalances = action.payload
        },
        setSgdBalance: (state, action) => {
            state.sgdBalance = action.payload
        },
        setReload: (state, action) => {
            state.reload = action.payload
        }
    },
})

export const { setWallet, setMyOrders, setAssetBalances, setSgdBalance, setReload } = walletSlice.actions;

export default walletSlice.reducer;