import type { LoCha, Project, User } from '~/libs/types'

export const useLoChas = () => useState<LoCha[]>('loChas')

export const useProjects = () => useState<Project[]>('projects')

export const useUser = () => useState<User | null>('user', () => null)
