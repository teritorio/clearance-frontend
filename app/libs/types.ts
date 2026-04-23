import type { ActionType } from '@teritorio/openstreetmap-logical-history-component'

export type ObjType = 'n' | 'w' | 'r'
export type ObjTypeFull = 'node' | 'way' | 'relation'

export type Key = string
export type Value = string

export function objTypeFull(objtype: ObjType): ObjTypeFull {
  return { n: 'node', w: 'way', r: 'relation' }[objtype] as ObjTypeFull
}

export type MultilingualString = Record<string, string>

export type Tags = Record<Key, Value>
export interface Member {
  ref: number
  role: string
  type: ObjType
}

export type HTMLTags = 'h1' | 'h2' | 'h3' | 'h4'

export interface ObjectId {
  objtype: ObjType
  id: number
  version: number
  deleted: boolean
}

export interface Changeset {
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
  tags: Record<string, string>
}

export interface User {
  osm_uid: number
  osm_name: string
  osm_image_url: string
  projects: string[]
}

export interface Validator {
  [key: string]: any

  action: ActionType
  action_force: ActionType
  description: string
}

export type Validators = Record<string, Validator>

export function getValidators(
  apiEndpoint: string,
  project: string,
): Promise<Validator> {
  return fetch(`${apiEndpoint}/projects/${project}/validators/`).then(
    (data) => {
      if (data.ok) {
        return data.json() as unknown as Validator
      }
      else {
        return Promise.reject(
          new Error([data.url, data.status, data.statusText].join(' ')),
        )
      }
    },
  )
}

export interface UserGroup {
  title: MultilingualString
  polygon?: string
  users: string[]
}

export interface UninitializedProject {
  id: string
  initialized: false
}

export interface InitializedProject {
  id: string
  title: MultilingualString
  description: MultilingualString
  date_last_update?: string | null
  to_be_validated?: number
  main_contacts: string[]
  user_groups: UserGroup[]
  project_tags: string[]
}

export type Project = UninitializedProject | InitializedProject

export function isInitializedProject(project: Project): project is InitializedProject {
  return !('initialized' in project && project.initialized === false)
}

export interface ProjectsResponse {
  admin?: string
  projects: Project[]
}

export function getProjects(apiEndpoint: string): Promise<ProjectsResponse> {
  return fetch(`${apiEndpoint}/projects`).then((data) => {
    if (data.ok) {
      return data.json() as unknown as ProjectsResponse
    }
    else {
      return Promise.reject(
        new Error([data.url, data.status, data.statusText].join(' ')),
      )
    }
  })
}

export function getProject(
  apiEndpoint: string,
  project: string,
): Promise<InitializedProject> {
  return fetch(`${apiEndpoint}/projects/${project}`).then((data) => {
    if (data.ok) {
      return data.json() as unknown as InitializedProject
    }
    else {
      return Promise.reject(
        new Error([data.url, data.status, data.statusText].join(' ')),
      )
    }
  })
}
