import { createSlice } from '@reduxjs/toolkit'

export const navSlice = createSlice({
    name: 'nav',
    initialState: {
        navs: {
            'hs': {
                id: 'hs',
                name: 'Hot Sale',
            },
            'ma': {
                id: 'ma',
                name: 'My Asset'
            },
            'bh': {
                id: 'bh',
                name: 'Browse History'
            }
        },
        currentNav: 'hs'
    },
    reducers: {
        setCurrent: (state, action) => {
            state.currentNav = action.payload;
        }
    },
})

export const { setCurrent } = navSlice.actions

export default navSlice.reducer