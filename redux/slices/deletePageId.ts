import { createSlice } from "@reduxjs/toolkit";

const deletedPageIdSlice = createSlice({
  name: 'deletePageId',
  initialState: null,
  reducers: {
    setDeletedPageId(state, action) {
      return action.payload
    }
  }
})

export const { setDeletedPageId } = deletedPageIdSlice.actions;
export default deletedPageIdSlice.reducer;


