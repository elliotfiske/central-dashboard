import { ProjectData } from "./toggl-data"

export interface TimeEntryReportResult {
  per_page: number
  total_count: number
  data: TimeEntry[]
}

/** Stuff that comes in from the websocket */
interface TogglUpdateEntryMessage {
  action: "INSERT" | "UPDATE" | "DELETE"
  data: TimeEntry
  model: string
}

interface Heartbeat {
  type: "ping" | "pong"
}

export interface TimeEntry {
  id: number
  wid?: number
  dur?: number
  pid: number
  tid: number | null
  description: string
  billable: number
  duronly?: boolean
  start: string
  stop?: string
  at?: string
  server_deleted_at?: string
  tags: any[]
  // Project Name
  project?: string
  // Populated by me
  projectData?: ProjectData
  cur: string
  is_billable: boolean
  client?: string
  updated: string
  use_stop?: boolean
  user?: string
  task?: string | null
}

export type TogglMessage = HeartBeat | TogglUpdateEntryMessage
