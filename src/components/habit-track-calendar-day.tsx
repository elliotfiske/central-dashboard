import React, { FC } from "react"
import { Dayjs } from "dayjs"
import { useAppSelector } from "../model/store"
import { keys, pick } from "lodash"
import { TimeEntry } from "../model/toggl-event"
import styled from "styled-components"

const DayBg = styled.div<{ thisMonth: boolean }>`
  background-color: ${(props) => (props.thisMonth ? "#868eec" : "#222c99")};
  width: 32px;
  height: 32px;
  border-radius: 6px;
  margin: 4px;
  color: black;
`

export const Day: FC<{ day: Dayjs; thisMonth: boolean }> = ({
  day,
  thisMonth,
}) => {
  const entryIds =
    useAppSelector(
      (state) => state.timeEntries.idsByDate[day.format("YYYY-MM-DD")]
    ) ?? {}

  const entriesById = useAppSelector((state) =>
    pick<Record<string, TimeEntry>, string>(
      state.timeEntries.byId,
      keys(entryIds)
    )
  )

  const cleaningMinutes = Object.values(entriesById)
    .filter((entry) => {
      // TODO: Would be cool to include the current time entry in this,
      //    so you can see the square turn purple in real-time
      return (
        entry.project === "Chores" &&
        entry.description === "Cleaning" &&
        !!entry.dur
      )
    })
    .map((entry) => {
      return entry.dur! / 60_000
    })
    .reduce((prev, curr) => prev + curr, 0)

  const cleaningSuccess = cleaningMinutes > 30

  const entries = Object.values(entriesById)

  return (
    <DayBg
      thisMonth={thisMonth}
      onClick={() => {
        console.log(entries)
      }}
    >
      {cleaningSuccess ? "!!" : day.date().toString()}
    </DayBg>
  )
}
