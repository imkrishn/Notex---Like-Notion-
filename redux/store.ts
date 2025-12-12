import { configureStore } from "@reduxjs/toolkit";
import pageDataSlice from "./slices/pageData";

export const store = configureStore({
  reducer: {
    pageData: pageDataSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
