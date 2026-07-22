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
    // Parallel array: linkSemanticGroups[i] is the semantic_group key for links[i].
    // Required to call PUT /changes_logs/:locha_id/:semantic_group/accept correctly.
    linkSemanticGroups: string[]
    changesets: Changeset[] | null
  }
}

type RawClearanceLoChaData = Omit<ClearanceLoChaData, 'metadata'> & {
  metadata: Omit<ClearanceLoChaData['metadata'], 'links' | 'linkSemanticGroups'> & {
    links: Record<string, ClearanceApiLink[]>
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
          $fetch<RawClearanceLoChaData[]>(`${config.public.api}/projects/${projectSlug}/changes_logs`),
        ])

        // links comes as Record<semantic_group, ...>. Sort keys numerically and build a
        // dense 0-based array so LoCha can index into it. Also remap features.properties.links
        // from semantic_group key to the matching 0-based position, since that field carries
        // the actual semantic_group value from the API (not a positional index).
        const loChas: ClearanceLoChaData[] = rawLoChas.map((loCha) => {
          const linkSemanticGroups = Object.keys(loCha.metadata.links).sort((a, b) => Number(a) - Number(b))
          const keyToIndex = new Map(linkSemanticGroups.map((key, i) => [Number(key), i]))
          return {
            ...loCha,
            features: loCha.features.map((f) => ({
              ...f,
              properties: {
                ...f.properties,
                links: keyToIndex.get(f.properties.links) ?? f.properties.links,
              },
            })),
            metadata: {
              ...loCha.metadata,
              links: linkSemanticGroups.map((key) => loCha.metadata.links[key]!),
              linkSemanticGroups,
            },
          }
        })

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
