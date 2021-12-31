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
import {
  BehaviorSubject,
  combineLatest,
  merge,
  Observable,
  ObservableInput,
  ObservedValueOf,
} from "rxjs"
import { ProjectData } from "./toggl-data"
import dayjs from "dayjs"
import { store } from "./store"
import { setTimeEntriesForDay } from "../slices/time-entries"

const $websocketSubject$ = webSocket<TogglMessage>(
  "wss://track.toggl.com/stream"
) as WebSocketSubject<TogglMessage>

$websocketSubject$.subscribe(
  (msg: TogglMessage) => {
    if (msg.type === "ping") {
      $websocketSubject$.next({ type: "pong" })
    }
  },
  (err) => {
    console.log(err)
  },
  () => {
    console.log(`complete`)
  }
)

const socketRunningEntry$: Observable<TimeEntry> = $websocketSubject$.pipe(
  filter((event) => {
    // Entries with no stop time are (probably) currently running
    return !!event.data && !event.data?.stop
  }),
  map((event: TogglMessage) => {
    return event.data
  })
)

const rawRunningEntry$: Observable<TimeEntry> = merge(
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

const runningEntry$: Observable<TimeEntry> = combineLatest([
  projectData$,
  rawRunningEntry$,
]).pipe(
  filter(([a, b]) => {
    return !!a && !!b
  }),
  map(([projects, entry]: [ProjectData[], TimeEntry]) => {
    const projectData = projects.find((p) => p.id === entry.pid)
    return { ...entry, projectData }
  })
)

const $entryIntervalsToFetch$ = new BehaviorSubject({
  begin: dayjs().subtract(1, "week"),
  end: dayjs(),
})

// const getEntriesForDates = (begin: Dayjs, end: Dayjs) => {
//   store.dispatch(setFetchingEntries())
//
//   return api.getWorkspace().pipe(
//     mergeMap((workspace) => {
//       return api.getHistoricalEntries(workspace.id.toString(), begin, end)
//     })
//   )
//     .subscribe(
//       (entries) => {
//         store.dispatch(setTimeEntriesForDay(entries.data))
//       },
//       (error) => console.warn(`Error happened! ${error}`)
// }

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

// For each Obserable, buffer them all up so CombineLatest works the way I want it to
export function combineLatestBuffered<O1 extends ObservableInput<any>>(
  sources: [O1]
): Observable<[ObservedValueOf<O1>]> {
  const allReady: Observable<number> = combineLatest(sources).pipe(
    map((_) => 0)
  )

  return combineLatest(sources)
}

const oldEntries$ = combineLatest([
  api.getWorkspace(),
  $entryIntervalsToFetch$.pipe(queueUntil(api.getWorkspace())),
])
  .pipe(
    mergeMap(([workspace, { begin, end }]) => {
      return api.getHistoricalEntries(workspace.id.toString(), begin, end)
    })
  )
  .subscribe(
    (entries) => {
      store.dispatch(setTimeEntriesForDay(entries.data))
    },
    (error) => console.warn(`Error happened! ${error}`)
  )

export const entryObservables = {
  $websocketSubject$,
  runningEntry$,
  oldEntries$,
  $entryIntervalsToFetch$,
}
