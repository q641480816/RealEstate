import { createSlice } from '@reduxjs/toolkit'

export const propertySlice = createSlice({
    name: 'property',
    initialState: {
        properties: []
    },
    reducers: {
        setProperty: (state, action) => {
            state.properties = action.payload;
        }
    },
})

export const { setProperty } = propertySlice.actions

export default propertySlice.reducer;