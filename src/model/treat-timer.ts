import { entryObservables } from "./entry-observables"
import { map, mapTo, switchMap } from "rxjs/operators"
import { delay, EMPTY, interval, of } from "rxjs"

let timeLeft: number | null = parseInt(
  localStorage.getItem("treat-timer") ?? "-1"
)

if (isNaN(timeLeft) || timeLeft === -1) {
  timeLeft = null
}

export const minus5Every5Seconds$ = interval(1_000).pipe(mapTo(-1))

let timerFinishTime: number | null = null

export const rewardTriggered$ = entryObservables.runningEntry$.pipe(
  map((entry) => entry?.tags?.includes("Treatable")),
  switchMap((val) => {
    if (val && timeLeft !== null) {
      return of(true).pipe(delay(timeLeft))
    } else {
      return of(false)
    }
  }),
  map((value) => {
    // timeLeft += value
    // if (timeLeft < 0) {
    // timeLeft = Math.ceil((Math.random() * 4 + 3) * 60)
    // }

    return value
  })
)
