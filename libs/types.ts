import { GeoJSON } from 'geojson'

export type ObjType = 'n' | 'w' | 'r'
export type ObjTypeFull = 'node' | 'way' | 'relation'

export type Key = string
export type Value = string

export function objTypeFull(objtype: ObjType): ObjTypeFull {
  return { n: 'node', w: 'way', r: 'relation' }[objtype] as ObjTypeFull
}

export type MultilingualString = Record<string, string>

export type Tags = Record<Key, Value>
export type Member = {
  ref: number
  role: string
  type: ObjType
}

export interface Subject extends Record<string, any> {
  version: number
  deleted: boolean
  changeset_id: number
  created: string
  tags: Tags
  members?: Member[]
  geom: GeoJSON.Geometry
}

export type Changeset = {
  id: number
  created_at: string
  closed_at: string
  open: boolean
  user: string
  uid: number
  minlat: number
  minlon: number
  maxlat: number
  maxlon: number
  comments_count: number
  changes_count: number
  tags: Tags
}

export type Match = {
  icon: string
  name: MultilingualString
  selectors: string[]
  sources: string[]
  user_groups: string[]
}

export type LogAction = 'accept' | 'reject'
export type LogActionOptions = Record<string, string | string[] | object>
export type Action = [string, LogAction | null, LogActionOptions | null]
export type Actions = Record<Key, Action[]>
export type Log = {
  objtype: ObjType
  id: number
  base?: Subject
  change: Subject
  matches: Match[]
  action: LogAction
  changesets: Changeset[]
  diff_attribs?: Actions
  diff_tags?: Actions
}

export type ObjectId = {
  objtype: ObjType
  id: number
  version: number
  deleted: boolean
}

export type Logs = Log[]

export function getLogs(apiEndpoint: string, project: string): Promise<Logs> {
  return fetch(`${apiEndpoint}/projects/${project}/changes_logs/`).then(
    (data) => {
      if (data.ok) {
        return data.json() as unknown as Logs
      } else {
        return Promise.reject(
          new Error([data.url, data.status, data.statusText].join(' '))
        )
      }
    }
  )
}

export function setLogs(
  apiEndpoint: string,
  project: string,
  logAction: LogAction,
  objectsIds: ObjectId[]
): Promise<void> {
  return fetch(`${apiEndpoint}/projects/${project}/changes_logs/${logAction}`, {
    credentials: 'include',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(objectsIds),
  }).then((data) => {
    if (!data.ok) {
      return Promise.reject(
        new Error([data.url, data.status, data.statusText].join(' '))
      )
    }
  })
}

export function action2priority(logAction: LogAction | null): number {
  return logAction ? { reject: 2, accept: 0 }[logAction] : 1
}

export function maxActionPriority(actions: Action[]): number {
  return Math.max(...actions.map((action) => action2priority(action[1])))
}

export type Validator = {
  [key: string]: any

  action: LogAction
  action_force: LogAction
  description: string
}

export type Validators = Record<string, Validator>

export function getValidators(
  apiEndpoint: string,
  project: string
): Promise<Validator> {
  return fetch(`${apiEndpoint}/projects/${project}/validators/`).then(
    (data) => {
      if (data.ok) {
        return data.json() as unknown as Validator
      } else {
        return Promise.reject(
          new Error([data.url, data.status, data.statusText].join(' '))
        )
      }
    }
  )
}

export type UserGroup = {
  title: MultilingualString
  polygon?: string
  users: string[]
}

export type Project = {
  id: string
  title: MultilingualString
  description: MultilingualString
  date_last_update: string
  to_be_validated?: number
  main_contacts: string[]
  user_groups: UserGroup[]
  project_tags: string[]
}

export type Projects = Project[]

export function getProjects(apiEndpoint: string): Promise<Projects> {
  return fetch(`${apiEndpoint}/projects`).then((data) => {
    if (data.ok) {
      return data.json() as unknown as Projects
    } else {
      return Promise.reject(
        new Error([data.url, data.status, data.statusText].join(' '))
      )
    }
  })
}

export function getProject(
  apiEndpoint: string,
  project: string
): Promise<Project> {
  return fetch(`${apiEndpoint}/projects/${project}`).then((data) => {
    if (data.ok) {
      return data.json() as unknown as Project
    } else {
      return Promise.reject(
        new Error([data.url, data.status, data.statusText].join(' '))
      )
    }
  })
}
