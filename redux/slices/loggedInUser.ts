import { User } from "@/types/userType";
import { createSlice } from "@reduxjs/toolkit";

const initialState: User = {
  $id: undefined,
  fullName: undefined,
  email: undefined,
}

const loggedInUserSlice = createSlice({
  name: 'loggedInUser',
  initialState,
  reducers: {
    setLoggedInUser(state, action) {
      state.$id = action.payload.$id;
      state.fullName = action.payload.fullName;
      state.email = action.payload.email;
    }
  }
});

export const { setLoggedInUser } = loggedInUserSlice.actions;
export default loggedInUserSlice.reducer;