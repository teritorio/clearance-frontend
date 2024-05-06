import type { Log, Project } from '~/libs/types'

export const useLogs = () => useState<Log[]>('logs')

export const useProjects = () => useState<Project[]>('projects')
