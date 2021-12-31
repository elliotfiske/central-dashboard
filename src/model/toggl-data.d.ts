/**
 * Toggl metadata - projects, workspaces, tasks...
 */
export interface TogglWorkspace {
  id: number
  name: string
  profile: number
  premium: boolean
  admin: boolean
  default_hourly_rate: number
  default_currency: string
  only_admins_may_create_projects: boolean
  only_admins_see_billable_rates: boolean
  only_admins_see_team_dashboard: boolean
  projects_billable_by_default: boolean
  rounding: number
  rounding_minutes: number
  api_token: string
  at: string
  logo_url: string
  ical_url: string
  ical_enabled: boolean
}

export interface ProjectData {
  id: number
  wid: number
  cid: number
  name: string
  billable: boolean
  is_private: boolean
  active: boolean
  template: boolean
  at: string
  created_at: string
  color: string
  auto_estimates: boolean
  actual_hours: number
  hex_color: string
  currency?: string
}
