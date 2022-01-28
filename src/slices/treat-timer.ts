import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface TreatTimerState {
  target: number | null
}

const initialState: TreatTimerState = {
  target: null,
}

const treatTimerSlice = createSlice({
  name: "treatTimer",
  initialState,
  reducers: {
    startNewTimer: (state, action: PayloadAction<number>) => {
      state.target = action.payload
    },
  },
})
