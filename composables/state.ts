import type { LoCha, Log, Project, User } from '~/libs/types'

export const useLoChas = () => useState<LoCha[]>('loChas')

export const useLogs = () => useState<Log[]>('logs')

export const useProjects = () => useState<Project[]>('projects')

export const useUser = () => useState<User | null>('user', () => null)
