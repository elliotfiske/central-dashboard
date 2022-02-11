import {
  delay,
  interval,
  Observable,
  of,
  shareReplay,
  startWith,
  take,
} from "rxjs"
import { concat, filter, map, tap } from "rxjs/operators"
import { TimeEntry, TimeEntryReportResult, TogglMessage } from "./toggl-event"
import { ProjectData, TogglWorkspace } from "./toggl-data"
import { axiosRxGet, axiosRxGetPaged } from "./api-helpers"
import dayjs, { Dayjs } from "dayjs"
import { defaultMemoize } from "reselect"

export const getCurrentRunningEntry = defaultMemoize(
  (): Observable<TimeEntry> => {
    return axiosRxGet("api/v8/time_entries/current").pipe(
      map((message: TogglMessage) => message.data),
      shareReplay(1)
    )
  }
)

export const getWorkspace = defaultMemoize((): Observable<TogglWorkspace> => {
  const cachedWorkspaces = JSON.parse(
    localStorage.getItem("workspaces") || "null"
  ) as TogglWorkspace[] | null

  const network: Observable<TogglWorkspace> = axiosRxGet<TogglWorkspace[]>(
    "api/v8/workspaces"
  ).pipe(
    delay(1000),
    tap((workspaces) =>
      localStorage.setItem("workspaces", JSON.stringify(workspaces))
    ),
    map((workspaces: TogglWorkspace[]) => workspaces[0]!)
  )

  return of(cachedWorkspaces).pipe(
    filter((value): value is TogglWorkspace[] => value !== null),
    map((workspaces: TogglWorkspace[]) => workspaces[0]!),
    concat(network),
    shareReplay(1)
  )
})

export const getProjects = defaultMemoize(
  (workspaceId: string): Observable<ProjectData[]> => {
    const cachedProjects = JSON.parse(
      localStorage.getItem("projects") || "null"
    )

    return axiosRxGet<ProjectData[]>(
      `api/v8/workspaces/${workspaceId}/projects`
    ).pipe(
      tap((projects) =>
        localStorage.setItem("projects", JSON.stringify(projects))
      ),
      startWith(cachedProjects as ProjectData[] | null),
      filter((val): val is ProjectData[] => val !== null),
      shareReplay(1)
    )
  }
)

// This will be hella cached.
export const getHistoricalEntries = (
  workspaceId: string,
  fromDate: Dayjs,
  toDate: Dayjs
): Observable<TimeEntry[]> => {
  const from = dayjs(fromDate).format("YYYY-MM-DD")
  const to = dayjs(toDate).format("YYYY-MM-DD")

  let gotSoFar = 0
  let page = 1

  // const lol = { owo: "whatsthis" } as unknown as TimeEntry
  //
  // return of([lol, lol, lol])

  /*return*/ axiosRxGetPaged<TimeEntryReportResult>(
    `reports/api/v2/details?\
  user_agent=elliotfiske@gmail.com&workspace_id=${workspaceId}&since=${from}&until=${to}`,
    (apiResult) => {
      gotSoFar += apiResult.per_page
      if (gotSoFar >= apiResult.total_count) {
        return null
      }
      return `reports/api/v2/details?user_agent=elliotfiske@gmail.com&workspace_id=${workspaceId}&since=${from}&until=${to}&page=${++page}`
    }
  ).pipe(
    tap((val) => {
      console.log("here... " + JSON.stringify(val))
    }),
    map((apiResult) => apiResult.data)
  )

  return interval(1_000).pipe(
    map((_) => [{ lol: "hi" }] as unknown as TimeEntry[]),
    tap(console.log, null, () => {
      console.log("Complete")
    }),
    take(4)
  )
}
