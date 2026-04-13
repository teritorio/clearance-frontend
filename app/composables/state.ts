import type { Project, User } from '~/libs/types'

export const useAdmin = () => useState<string | null>('admin', () => null)

export const useProjects = () => useState<Project[]>('projects')

export const useUser = () => useState<User | null>('user', () => null)
