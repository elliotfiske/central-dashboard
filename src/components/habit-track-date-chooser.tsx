import React, { FC, useState } from "react"
import "./habit-track-date-chooser.css"
import dayjs from "dayjs"
import HabitTrackCalendar from "./habit-track-calendar"

export interface HabitTrackDisplayProps {}

const HabitTrackDateChooser: FC<HabitTrackDisplayProps> = () => {
  const monthStart = dayjs().startOf("month")

  const [startDate, setStartDate] = useState(monthStart)

  return (
    <div>
      <button
        onClick={() => {
          setStartDate((prevState) =>
            prevState.subtract(1, "month").startOf("month")
          )
        }}
      >
        Previous Month
      </button>
      <button
        onClick={() => {
          setStartDate((prevState) =>
            prevState.add(1, "month").startOf("month")
          )
        }}
      >
        Next Month
      </button>
      <div>
        Showing stuff for month: {startDate.format("MMMM")}
        <br />
      </div>
      <HabitTrackCalendar startDate={startDate} />
    </div>
  )
}

export default HabitTrackDateChooser
