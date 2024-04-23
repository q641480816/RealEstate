import { configureStore } from '@reduxjs/toolkit'
import navSlice from './navSlice'

export default configureStore({
  reducer: {
    nav: navSlice
  },
})