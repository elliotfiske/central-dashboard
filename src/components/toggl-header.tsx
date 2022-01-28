import { useObservable } from "rxjs-hooks"
import { entryObservables } from "../model/entry-observables"
import { useEffect, useRef, useState } from "react"
import dayjs from "dayjs"
import "./toggl-header.css"
import styled from "styled-components"
import { countdown$ } from "../model/treat-timer"
import useSound from "use-sound"
// @ts-ignore
import treatSound from "./treat_sound_trimmed.mp3"
import { startWith } from "rxjs"

const TimerRoot = styled.div<{ bgColor?: string }>`
  background-color: ${(props) => props.bgColor ?? "clear"};
`

function usePrevious(value: any) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef()
  // Store current value in ref
  useEffect(() => {
    ref.current = value
  }, [value]) // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current
}

const TogglHeader = () => {
  const runningEntry = useObservable(() => {
    return entryObservables.runningEntry$
  })

  const countdown = useObservable(() => {
    return countdown$.pipe(startWith(-1))
  })

  const [hideCountdown, setHideCountdown] = useState(true)

  const [play] = useSound(treatSound)
  const [rando, setRando] = useState(0)
  const [maxim, setMaxim] = useState(100)

  const [elapsed, setElapsed] = useState(0)

  const prevCountdown = usePrevious(countdown)

  useEffect(() => {
    if (prevCountdown !== 0 && countdown === 0) {
      play()
      // const newRando =
      const newRando = Math.floor(Math.random() * maxim + 1)
      setRando(newRando)
      setMaxim(maxim - 1)
      if (newRando === 0) {
        window.alert("Big winner!")
      }
    }
  }, [prevCountdown, countdown, play, setRando, maxim, setMaxim])

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
      <button
        onClick={() => {
          play()
        }}
      >
        Play me
      </button>
      <TimerRoot bgColor={runningEntry.projectData?.hex_color}>
        <div id="timerMaxWidth" className="timerText">
          1d:00:00:00
        </div>
        <div id="timer" className="timerText projectText">
          {formattedElapsed}
        </div>
      </TimerRoot>
      <div id="projectTitle" className="projectText">
        {runningEntry?.projectData?.name}
      </div>
      <div id="runningEntryTitle" className="projectText">
        {runningEntry?.description}
      </div>
      <div className="projectTag">{runningEntry?.tags?.join(", ")}</div>
      <div>{!hideCountdown && countdown}</div>
      <button
        onClick={() => {
          setHideCountdown(!hideCountdown)
        }}
      >
        {hideCountdown ? "Hide Countdown" : "Show Countdown"}
      </button>
      <div>Here's... rando! {rando}</div>
      <div>Also heres maxim!! {maxim}</div>
    </>
  )
}

export default TogglHeader
