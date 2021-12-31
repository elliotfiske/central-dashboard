import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { TimeEntry } from "../model/toggl-event"
import dayjs, { Dayjs } from "dayjs"

type SetOfIds = Record<string, boolean>

// Key = date string, value = all Time Entry IDs that started on that day.
type TimeEntryIdsByDate = Record<string, SetOfIds>

export interface TimeEntryState {
  byId: Record<string, TimeEntry>
  idsByDate: TimeEntryIdsByDate
  // Key = date string, value = error that ocurred when fetching for that date, if any.
  errorsByDate: Record<string, string>
  entriesBeingFetched: boolean
}

const initialState: TimeEntryState = {
  byId: {},
  idsByDate: {},
  errorsByDate: {},
  entriesBeingFetched: false,
}

const timeEntrySlice = createSlice({
  name: "timeEntries",
  initialState,
  reducers: {
    setTimeEntriesForDay: (state, action: PayloadAction<TimeEntry[]>) => {
      action.payload.forEach((entry) => {
        state.byId[entry.id] = entry

        const day = dayjs(entry.start).startOf("day").format("YYYY-MM-DD")

        if (state.idsByDate[day] === undefined) {
          state.idsByDate[day] = {}
        }

        state.idsByDate[day]![entry.id] = true

        delete state.errorsByDate[day]
        state.entriesBeingFetched = false
      })
    },
    setErrorsForDay: (
      state,
      action: PayloadAction<{ date: Dayjs; error: string }[]>
    ) => {
      action.payload.forEach(({ date, error }) => {
        const dateStr = date.startOf("day").format("YYYY-MM-DD")
        state.errorsByDate[dateStr] = error
      })
    },
    setFetchingEntries: (state) => {
      state.entriesBeingFetched = true
    },
  },
})

export const { setTimeEntriesForDay, setErrorsForDay, setFetchingEntries } =
  timeEntrySlice.actions
export const timeEntryReducer = timeEntrySlice.reducer
