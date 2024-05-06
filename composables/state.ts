import type { Log, Project, User } from '~/libs/types'

export const useLogs = () => useState<Log[]>('logs')

export const useProjects = () => useState<Project[]>('projects')

export const useUser = () => useState<User | null>('user', () => null)
