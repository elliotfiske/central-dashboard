import { useObservable } from "rxjs-hooks"
import { runningEntry$ } from "../model/entry-observables"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import "./toggl-header.css"
import styled from "styled-components"
import { RewardNotifier } from "./rewards/reward-notifier"

const TimerRoot = styled.div<{ bgColor?: string }>`
  background-color: ${(props) => props.bgColor ?? "clear"};
`

const TogglHeader = () => {
  const runningEntry = useObservable(() => {
    return runningEntry$
  })

  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = dayjs(runningEntry?.start)

    if (!start) {
      console.error(
        "Didn't find a start time on entry " + JSON.stringify(runningEntry)
      )
      return
    }

    const elapsed = dayjs().diff(start)
    setElapsed(elapsed)

    const intervalId = setInterval(() => {
      const elapsed = dayjs().diff(start)
      setElapsed(elapsed)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [runningEntry])

  if (!runningEntry) {
    return <div>Nothin' running, friend!</div>
  }

  const d_elapsed = dayjs.duration(elapsed)
  const format = d_elapsed.days() > 0 ? "D[d] HH:mm:ss" : "HH:mm:ss"
  const formattedElapsed = d_elapsed.format(format)

  return (
    <>
      <TimerRoot bgColor={runningEntry.projectData?.hex_color}>
        <div className="timerText">1d:00:00:00</div>
        <div className="timerText ">{formattedElapsed}</div>
      </TimerRoot>
      <div>{runningEntry?.projectData?.name}</div>
      <div>{runningEntry?.description}</div>
      <div>{runningEntry?.tags?.join(", ")}</div>
      <RewardNotifier />
    </>
  )
}

export default TogglHeader
