import type { ApiLink, LoChaData } from '@teritorio/openstreetmap-logical-history-component'
import type { Project } from '~/libs/types'

export interface ClearanceMatch {
  sources: string[]
  selectors: string[]
  user_groups: string[]
}

export interface ClearanceApiLink extends ApiLink {
  matches: ClearanceMatch[]
}

export interface ClearanceLoChaData extends LoChaData {
  metadata: LoChaData['metadata'] & {
    locha_id: number
    links: ClearanceApiLink[][]
  }
}

interface ChangesLogsData {
  project: Project
  loChas: ClearanceLoChaData[]
  fetchedAt: Date
}

export function useChangesLogs(projectSlug: string) {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()

  return useAsyncData<ChangesLogsData>(
    `changes_logs-${projectSlug}`,
    async () => {
      try {
        const [project, loChas] = await Promise.all([
          $fetch<Project>(`${config.public.api}/projects/${projectSlug}`),
          $fetch<ClearanceLoChaData[]>(`${config.public.api}/projects/${projectSlug}/changes_logs`),
        ])

        return {
          project,
          loChas,
          fetchedAt: new Date(),
        }
      }
      catch (err) {
        if (err instanceof Error) {
          ElMessage.error({
            duration: 5000,
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
      getCachedData(key): ChangesLogsData | undefined {
        const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key]

        if (!data) {
          return undefined
        }

        const expirationDate = new Date(data.fetchedAt)
        expirationDate.setTime(expirationDate.getTime() + 30 * 1000)
        const isExpired = expirationDate.getTime() < Date.now()

        if (isExpired) {
          return undefined
        }

        return data
      },
    },
  )
}
