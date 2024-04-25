import { configureStore } from '@reduxjs/toolkit'
import navSlice from './navSlice';
import walletSlice from './walletSlice';
import propertySlice from './propertySlice';
import loaderSlice from './loaderSlice';

export default configureStore({
  reducer: {
    nav: navSlice,
    wallet: walletSlice,
    property: propertySlice,
    loader: loaderSlice
  },
})