import { webSocket, WebSocketSubject } from "rxjs/webSocket"
import {
  bufferWhen,
  concatMap,
  filter,
  map,
  mergeMap,
  tap,
} from "rxjs/operators"
import { TimeEntry, TogglMessage } from "./toggl-event"
import * as api from "./api"
import { BehaviorSubject, combineLatest, EMPTY, merge, Observable } from "rxjs"
import { ProjectData } from "./toggl-data"
import dayjs from "dayjs"
import { store } from "./store"
import { setTimeEntriesForDay } from "../slices/time-entries"

const $websocketSubject$ = webSocket<TogglMessage>(
  "wss://track.toggl.com/stream"
) as WebSocketSubject<TogglMessage>

$websocketSubject$.subscribe({
  next: (msg: TogglMessage) => {
    if (msg.type === "ping") {
      $websocketSubject$.next({ type: "pong" })
    }
  },
  error: (err) => {
    console.log(err)
  },
  complete: () => {
    console.log(`websocket complete... correct???`)
  },
})

const socketRunningEntry$: Observable<TimeEntry | null> =
  $websocketSubject$.pipe(
    filter((event) => {
      return !!event.data && !event.data?.stop
    }),
    map((event: TogglMessage) => {
      // Entries with no stop time are (probably) currently running
      if (event?.data?.stop) {
        // Not sure of the best path. Works-ish but if you were to edit another
        //   random entry it will say "no more running entry boss"
        return null
      }
      return event.data
    })
  )

const rawRunningEntry$: Observable<TimeEntry | null> = merge(
  socketRunningEntry$,
  api.getCurrentRunningEntry()
)

// Kick off the initial requests
$websocketSubject$.next({
  type: "authenticate",
  api_token: process.env.REACT_APP_TOGGL_API_TOKEN ?? "",
})

export const projectData$ = api.getWorkspace().pipe(
  mergeMap((workspace) => {
    return api.getProjects(`${workspace.id}`)
  })
)

// // TODO-EF: Move me to an rx operator/helper file
export const queueUntil =
  <T>(signal$: Observable<any>) =>
  (source$: Observable<T>) => {
    let shouldBuffer = true

    return source$.pipe(
      bufferWhen(() =>
        shouldBuffer ? signal$.pipe(tap(() => (shouldBuffer = false))) : source$
      ),
      concatMap((v) => v)
    )
  }

const runningEntry$: Observable<TimeEntry | null> = combineLatest([
  projectData$,
  rawRunningEntry$.pipe(queueUntil(projectData$)),
]).pipe(
  filter(([a, b]) => {
    return !!a && !!b
  }),
  map(([projects, entry]: [ProjectData[], TimeEntry | null]) => {
    if (entry === null) {
      return null
    }

    const projectData = projects.find((p) => p.id === entry.pid)
    return { ...entry, projectData }
  })
)

const $entryIntervalsToFetch$ = new BehaviorSubject({
  begin: dayjs().subtract(1, "week"),
  end: dayjs(),
})

const oldEntries$ = combineLatest([
  api.getWorkspace(),
  $entryIntervalsToFetch$.pipe(queueUntil(api.getWorkspace())),
])
  .pipe(
    mergeMap(([workspace, { begin, end }]) => {
      // return api.getHistoricalEntries(workspace.id.toString(), begin, end)
      return EMPTY
    }),
    tap((val) => {
      console.log("And now this" + JSON.stringify(val))
    })
  )
  .subscribe({
    next: (entries) => {
      store.dispatch(setTimeEntriesForDay(entries))
    },
    error: (error) => console.warn(`Error happened! ${error}`),
  })

export const entryObservables = {
  $websocketSubject$,
  runningEntry$,
  oldEntries$,
  $entryIntervalsToFetch$,
}
