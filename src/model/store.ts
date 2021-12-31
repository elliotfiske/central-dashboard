import { configureStore } from "@reduxjs/toolkit"
import { timeEntryReducer } from "../slices/time-entries"
import { combineReducers } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

const rootReducer = combineReducers({ timeEntries: timeEntryReducer })
export type RootState = ReturnType<typeof rootReducer>

export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const store = configureStore({
  reducer: rootReducer,
  devTools: true,
})

