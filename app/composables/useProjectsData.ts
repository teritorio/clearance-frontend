import type { ProjectsResponse } from '~/libs/types'

interface ProjectsData extends ProjectsResponse {
  fetchedAt: Date
}

export function useProjectsData() {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()

  return useAsyncData<ProjectsData>(
    'projectsResponse',
    async () => ({
      ...await $fetch<ProjectsResponse>(`${config.public.api}/projects`),
      fetchedAt: new Date(),
    }),
    {
      getCachedData(key): ProjectsData | undefined {
        const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
        if (!data?.fetchedAt) {
          return undefined
        }
        const expirationDate = new Date(data.fetchedAt)
        expirationDate.setTime(expirationDate.getTime() + 30 * 1000)
        return expirationDate.getTime() < Date.now() ? undefined : data
      },
    },
  )
}
