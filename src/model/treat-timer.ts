import { entryObservables } from "./entry-observables"
import { map, mapTo, switchMap } from "rxjs/operators"
import { EMPTY, interval } from "rxjs"

let timeLeft = parseInt(localStorage.getItem("treat-timer") ?? "-1")
if (isNaN(timeLeft)) {
  timeLeft = -1
}

export const minus5Every5Seconds$ = interval(1_000).pipe(mapTo(-1))

export const countdown$ = entryObservables.runningEntry$.pipe(
  map((entry) => entry.tags?.includes("Treatable")),
  switchMap((val) => (val ? minus5Every5Seconds$ : EMPTY)),
  map((value) => {
    timeLeft += value
    if (timeLeft < 0) {
      timeLeft = Math.ceil((Math.random() * 5 + 10) * 60)
    }

    return timeLeft
  })
)
