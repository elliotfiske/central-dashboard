import { Observable } from "rxjs"
import { map, tap } from "rxjs/operators"
import { TimeEntry, TogglMessage } from "./toggl-event"
import { ProjectData, TogglWorkspace } from "./toggl-data"
import { axiosRxGet } from "./api-helpers"
import dayjs, { Dayjs } from "dayjs"

export const getCurrentRunningEntry = (): Observable<TimeEntry> => {
  return axiosRxGet("api/v8/time_entries/current").pipe(
    map((message: TogglMessage) => message.data),
    tap(console.log)
  )
}

export const getWorkspace = (): Observable<TogglWorkspace> => {
  return axiosRxGet<TogglWorkspace[]>("api/v8/workspaces").pipe(
    map((workspaces: TogglWorkspace[]) => workspaces[0]!)
  )
}

export const getProjects = (workspaceId: string): Observable<ProjectData[]> => {
  return axiosRxGet<ProjectData[]>(`api/v8/workspaces/${workspaceId}/projects`)
}

// This will be hella cached.
export const getHistoricalEntries = (
  workspaceId: string,
  fromDate: Dayjs,
  toDate: Dayjs
): Observable<{ data: TimeEntry[] }> => {
  const from = dayjs(fromDate).format("YYYY-MM-DD")
  const to = dayjs(toDate).format("YYYY-MM-DD")
  return axiosRxGet(
    `reports/api/v2/details?\
user_agent=elliotfiske@gmail.com&workspace_id=${workspaceId}&since=${from}&until=${to}`
  )
}
