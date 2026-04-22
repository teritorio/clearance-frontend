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
    await $fetch(`${apiBase}/../../../users`, {
      method: 'DELETE',
      credentials: 'include',
    })
    user.value = null
    await navigateTo('/')
  }

  const isAuthenticated = computed(() => user.value !== null)

  return { user: readonly(user), isAuthenticated, fetchUser, logout }
}
