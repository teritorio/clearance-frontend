import type { User } from '~/libs/types'

export function useAuth() {
  const user = useUser()
  const config = useRuntimeConfig()
  const apiBase = config.public.api

  async function fetchUser(): Promise<User | null> {
    try {
      const data = await $fetch<User>(`${apiBase}/users/me`, {
        credentials: 'include',
      })
      user.value = data
      return data
    }
    catch {
      user.value = null
      return null
    }
  }

  async function logout(): Promise<void> {
    try {
      await $fetch(`${apiBase}/../../../users`, {
        method: 'DELETE',
        credentials: 'include',
      })
    }
    finally {
      user.value = null
      await navigateTo('/')
    }
  }

  return { user: readonly(user), fetchUser, logout }
}
