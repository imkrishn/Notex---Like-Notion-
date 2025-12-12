import { createSlice } from "@reduxjs/toolkit";

type PageDataState = {
  id: string | undefined;
  title: string | undefined;
  logoUrl: string | undefined;
};

const initialState: PageDataState = {
  id: undefined,
  title: undefined,
  logoUrl: undefined,
};

const pageDataSlice = createSlice({
  name: "pageData",
  initialState,
  reducers: {
    setPageData: (state, action) => {
      state.id = action.payload.id;
      state.title = action.payload.title;
      state.logoUrl = action.payload.logoUrl;
    },
  },
});

export const { setPageData } = pageDataSlice.actions;
export default pageDataSlice.reducer;
