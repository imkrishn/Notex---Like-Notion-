import { configureStore } from '@reduxjs/toolkit'
import loggedInUserSlice from './slices/loggedInUser'
import deletedPageIdSlice from './slices/deletePageId'

export const store = configureStore({
  reducer: {
    loggedInUser: loggedInUserSlice,
    deletedPageId: deletedPageIdSlice,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch