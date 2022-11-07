export type ObjType = 'n' | 'w' | 'r'
export type Key = string
export interface Value extends String {}

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

export type LogAction = null | 'accept' | 'reject'
export type Action = [string, LogAction]
export type Actions = Record<Key, Action[]>
export type Log = {
  objtype: ObjType
  id: number
  base: Subject
  changes: Subject
  action: LogAction
  diff_attribs: Actions
  diff_tags: Actions
}

export type Logs = Log[]

export function getLogs(apiEndpoint: string): Promise<Logs> {
  return fetch(apiEndpoint).then((data) => {
    if (data.ok) {
      return data.json() as unknown as Logs
    } else {
      return Promise.reject(
        new Error([data.url, data.status, data.statusText].join(' '))
      )
    }
  })
}
