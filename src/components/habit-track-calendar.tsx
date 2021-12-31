import React, { FC, useEffect } from "react"
import "./habit-track-calendar.css"
import { Dayjs } from "dayjs"
import styled from "styled-components"
import assert from "assert"
import { Day } from "./habit-track-calendar-day"
import { entryObservables } from "../model/entry-observables"

export interface HabitTrackCalendarProps {
  startDate: Dayjs
}

const Week = styled.div`
  display: flex;
  justify-content: center;
`

const Month = styled.div``

/**
 * Generates an array of all the weeks of the month.
 *  Each 'week' element is itself an array of 7 days.
 */
function generateWeeksForMonth(start: Dayjs) {
  let curr = start.startOf("week")
  let end = start.endOf("month").endOf("week")
  const result: Dayjs[][] = []

  let currWeek = []

  while (curr.isBefore(end)) {
    currWeek.push(curr.startOf("day"))
    curr = curr.add(1, "day")

    if (currWeek.length === 7) {
      result.push(currWeek)
      currWeek = []
    }
  }

  return result
}

const HabitTrackCalendar: FC<HabitTrackCalendarProps> = ({ startDate }) => {
  useEffect(() => {
    entryObservables.$entryIntervalsToFetch$.next({
      begin: startDate,
      end: startDate.endOf("week"),
    })

    entryObservables.$entryIntervalsToFetch$.next({
      begin: startDate.endOf("week"),
      end: startDate.add(1, "week"),
    })

    entryObservables.$entryIntervalsToFetch$.next({
      begin: startDate.add(2, "week"),
      end: startDate.add(3, "week"),
    })
    entryObservables.$entryIntervalsToFetch$.next({
      begin: startDate.add(3, "week"),
      end: startDate.add(4, "week"),
    })
  }, [startDate])

  return (
    <Month>
      {generateWeeksForMonth(startDate).map((week) => {
        assert(week.length === 7)
        return (
          <Week key={week[0]!.toDate().valueOf()}>
            {week.map((day) => {
              const thisMonth = day!.month() !== startDate.month()
              return (
                <Day key={day!.valueOf()} thisMonth={thisMonth} day={day!} />
              )
            })}
          </Week>
        )
      })}
    </Month>
  )
}

export default HabitTrackCalendar
