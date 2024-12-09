import type { LoCha, Log, Project } from '~/libs/types'

interface ChangesLogsData {
  project: Project
  loChas: LoCha[]
  logs: Log[]
  fetchedAt: Date
}
export function useChangesLogs(projectSlug: string) {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()

  return useAsyncData<ChangesLogsData>(
    `changes_logs-${projectSlug}`,
    async () => {
      try {
        // Fetch project and change logs data concurrently
        const [project, loChas] = await Promise.all([
          $fetch<Project>(`${config.public.api}/projects/${projectSlug}`),
          $fetch<LoCha[]>(`${config.public.api}/projects/${projectSlug}/changes_logs`),
        ])

        return {
          project,
          loChas,
          logs: loChas.map((loCha) => loCha.objects).flat(),
          fetchedAt: new Date(),
        }
      }
      catch (err) {
        if (err instanceof Error) {
          ElMessage.error({
            duration: 0,
            message: err.message,
          })

          throw new Error(err.message)
        }
        else {
          throw new TypeError('Failed to fetch data')
        }
      }
    },
    {
      getCachedData(key) {
        const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key]

        if (!data) {
          return null
        }

        // Check if the cached data has expired
        const expirationDate = new Date(data.fetchedAt)
        expirationDate.setTime(expirationDate.getTime() + 30 * 1000)
        const isExpired = expirationDate.getTime() < Date.now()

        if (isExpired) {
          return null
        }

        return data
      },
    },
  )
}
