import type { ApiLink, IFeature, LoChaData } from '@teritorio/openstreetmap-logical-history-component'
import type { Changeset, InitializedProject } from '~/libs/types'
import { uniq } from 'underscore'

export interface ClearanceMatch {
  sources: string[]
  selectors: string[]
  user_groups: string[]
}

export interface ClearanceApiLink extends ApiLink {
  matches: ClearanceMatch[]
}

export interface ClearanceIFeature extends IFeature {
  properties: IFeature['properties'] & {
    changeset_id: number
    links: number
  }
}

export interface ClearanceLoChaData extends LoChaData {
  features: ClearanceIFeature[]
  metadata: LoChaData['metadata'] & {
    locha_id: number
    links: ClearanceApiLink[][]
    changesets: Changeset[] | null
  }
}

function getAfterChangesets(loCha: ClearanceLoChaData) {
  const featuresById = new Map(loCha.features.map((f) => [f.id as string, f]))
  const afterChangesetIds = new Set<number>()
  for (const link of loCha.metadata.links.flat()) {
    if (!link.after) {
      continue
    }
    const afterFeature = featuresById.get(link.after)
    if (!afterFeature) {
      continue
    }
    const afterChangesetId = afterFeature.properties.changeset_id
    if (link.before) {
      const beforeFeature = featuresById.get(link.before)
      if (beforeFeature?.properties.changeset_id === afterChangesetId) {
        continue
      }
    }
    afterChangesetIds.add(afterChangesetId)
  }
  return (loCha.metadata.changesets ?? []).filter((c) => afterChangesetIds.has(c.id))
}

export function getAfterUsers(loCha: ClearanceLoChaData): string[] {
  return uniq(getAfterChangesets(loCha).map((c) => c.user))
}

export function getAfterDates(loCha: ClearanceLoChaData): string[] {
  return uniq(getAfterChangesets(loCha).map((c) => c.created_at.substring(0, 10)))
}

interface ChangesLogsData {
  project: InitializedProject
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
        const [project, rawLoChas] = await Promise.all([
          $fetch<InitializedProject>(`${config.public.api}/projects/${projectSlug}`),
          $fetch<ClearanceLoChaData[]>(`${config.public.api}/projects/${projectSlug}/changes_logs`),
        ])

        // The API returns links as Record<semantic_group, ClearanceApiLink[]>.
        // Convert to a sparse array keyed by semantic_group so the LoCha lib can
        // access links[index] and Array.prototype.flat() skips removed groups.
        const loChas = rawLoChas.map((loCha) => ({
          ...loCha,
          metadata: {
            ...loCha.metadata,
            links: Object.entries(loCha.metadata.links as unknown as Record<string, ClearanceApiLink[]>)
              .reduce<ClearanceApiLink[][]>((acc, [key, val]) => {
                acc[Number(key)] = val
                return acc
              }, []),
          },
        }))

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
      deep: true,
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
