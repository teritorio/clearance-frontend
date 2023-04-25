export type ObjType = 'n' | 'w' | 'r'
export type Key = string
export interface Value extends String {}

export type MultilingualString = Record<string, string>

export type Tags = Record<Key, Value>
export type Member = {
  ref: number
  role: string
  type: ObjType
}

export type Subject = {
  version: number
  changeset: number
  created: string
  uid: number
  username: string
  tags: Tags
  lon?: number
  lat?: number
  nodes?: number[]
  members?: Member[]
}

export type LogAction = 'accept' | 'reject'
export type LogActionOptions = Record<string, Object>
export type Action = [string, LogAction | null, LogActionOptions | null]
export type Actions = Record<Key, Action[]>
export type Log = {
  objtype: ObjType
  id: number
  base: Subject
  change: Subject
  action: LogAction
  diff_attribs: Actions
  diff_tags: Actions
}

export type ObjectId = {
  objtype: ObjType
  id: number
  version: number
}

export type Logs = Log[]

export function getLogs(apiEndpoint: string, project: string): Promise<Logs> {
  return fetch(`${apiEndpoint}/${project}/changes_logs/`).then((data) => {
    if (data.ok) {
      return data.json() as unknown as Logs
    } else {
      return Promise.reject(
        new Error([data.url, data.status, data.statusText].join(' '))
      )
    }
  })
}

export function setLogs(
  apiEndpoint: string,
  project: string,
  logAction: LogAction,
  objectsId: ObjectId
): Promise<Object> {
  return fetch(`${apiEndpoint}/${project}/changes_logs/${logAction}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(objectsId),
  }).then((data) => {
    if (data.ok) {
      return data.json() as unknown as Object
    } else {
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
  return fetch(`${apiEndpoint}/${project}/validators/`).then((data) => {
    if (data.ok) {
      return data.json() as unknown as Validator
    } else {
      return Promise.reject(
        new Error([data.url, data.status, data.statusText].join(' '))
      )
    }
  })
}

export type Project = {
  description: MultilingualString
  date_start: String
  date_last_update: String
}

export type Projects = Record<string, Project>

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
