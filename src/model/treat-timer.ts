import { runningEntry$ } from "./entry-observables"
import { distinctUntilChanged, map, share, switchMap } from "rxjs/operators"
import {
  BehaviorSubject,
  combineLatest,
  delay,
  EMPTY,
  interval,
  of,
} from "rxjs"

function getLastTimerFromLocalStorage() {
  // let savedTime = parseInt(localStorage.getItem("treat-timer") ?? "-1")
  // if (isNaN(savedTime) || savedTime === -1) {
  //   savedTime = $timeLeft$.getValue()
  // }
  // return savedTime
  return 6000
}

const previousTimeLeft = getLastTimerFromLocalStorage()

// todo: 5000 -> random timer of what you've chosen
const $timeLeft$ = new BehaviorSubject(previousTimeLeft ?? 6000)

const treatableRunning$ = runningEntry$.pipe(
  map((entry) => entry?.tags?.includes("Treatable") ?? false)
)

// Emits TRUE whenever it is time for a treat :)
export const rewardTriggered$ = combineLatest([
  $timeLeft$,
  treatableRunning$,
]).pipe(
  switchMap(([timeLeft, isRunning]) => {
    if (isRunning && timeLeft !== null) {
      console.log(`Treating you in ${timeLeft / 1000}s`)
      return of(true).pipe(delay(timeLeft))
    } else {
      console.log("Just kidding")
      return EMPTY
    }
  }),
  share()
)

// If there is a treatable timer running, every 5 seconds subtract
//    5 from the saved timer value
treatableRunning$
  .pipe(
    distinctUntilChanged(),
    switchMap((isRunning) => {
      return isRunning ? interval(5000) : EMPTY
    })
  )
  .subscribe(() => {
    const savedTime = getLastTimerFromLocalStorage()

    localStorage.setItem("treat-timer", (savedTime - 5).toString())
  })

// When reward is triggered, reset the timer to a new value
rewardTriggered$.subscribe((_) => {
  const newTime = Math.random() * 5 + 5
  $timeLeft$.next(newTime * 1000)
})
