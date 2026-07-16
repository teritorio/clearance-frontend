<script setup lang="ts">
import type { Action } from '@teritorio/openstreetmap-logical-history-component'
import type { LocationQuery } from 'vue-router'
import type { ClearanceApiLink, ClearanceLoChaData, ClearanceMatch } from '~/composables/useChangesLogs'
import { countBy, indexBy, sortBy, uniq } from 'underscore'
import { getAfterDates, getAfterUsers } from '~/composables/useChangesLogs'

const props = defineProps<{
  loChas: ClearanceLoChaData[]
}>()

const route = useRoute()
const router = useRouter()

const filters = ref<LocationQuery>()

watchEffect(() => {
  filters.value = route.query
})

const stats = computed(() => {
  const actions = props.loChas
    .flatMap((loCha) =>
      uniq(
        loCha.metadata.links.flat()
          .flatMap((link: ClearanceApiLink) => [
            ...Object.values(link.diff_attribs || {}),
            ...Object.values(link.diff_tags || {}),
          ])
          .flat()
          .map((action: Action) => action[0]),
      ),
    )
  return getStats(actions)
})

const statSelectors = computed(() => {
  const matches = props.loChas.flatMap((loCha) =>
    uniq(loCha.metadata.links.flat().flatMap((link: ClearanceApiLink) => link.matches)).flat(),
  )
  return getStats(matches, (m: ClearanceMatch) => m.selectors.join(';'))
})

const statUserGroups = computed(() => {
  const userGroups = props.loChas
    .flatMap((loCha) =>
      uniq(loCha.metadata.links.flat().flatMap((link: ClearanceApiLink) => link.matches.flatMap((m) => m.user_groups))),
    )
  return getStats(userGroups)
})

const statUsers = computed(() => getStats(props.loChas.flatMap(getAfterUsers)))

const statDates = computed(() => {
  const dates = props.loChas.flatMap(getAfterDates)
  return getStats(dates).sort()
})

function getStats<Type>(data: Type[], key: (o: Type) => string = (i) => `${i}`): [Type, number][] {
  const index = indexBy(data, key)
  return sortBy(
    Object.entries(countBy(data, key)) as [string, number][],
    ([_key, count]) => -count,
  ).map(([key, count]) => [index[key]!, count])
}

async function applyFilter(key: string, value: string) {
  const query = filters.value?.[key] === value
    ? Object.fromEntries(Object.entries(route.query).filter(([k, _v]) => k !== key))
    : { ...route.query, [key]: value }
  await router.replace({ ...route, query })
}

async function resetAllFilters() {
  await router.replace({ ...route, query: undefined })
}

const hasActiveFilters = computed(() => Object.keys(filters.value ?? {}).length > 0)
</script>

<template>
  <aside class="log-filters">
    <p class="filters-title">
      {{ $t('logs.filters') }}
    </p>

    <div v-if="stats.length" class="filter-group">
      <label>{{ $t('logs.filterAction') }}</label>
      <div class="filter-chips">
        <el-badge
          v-for="[key, count] in stats"
          :key="key"
          :value="count"
          class="item"
          :max="999"
        >
          <el-button
            type="danger"
            :plain="filters?.filterByAction !== key"
            :disabled="!!(filters?.filterByAction && filters?.filterByAction !== key)"
            size="small"
            @click="applyFilter('filterByAction', key)"
          >
            {{ key }}
          </el-button>
        </el-badge>
      </div>
    </div>

    <div v-if="statUserGroups.length" class="filter-group">
      <label>{{ $t('logs.filterUserGroups') }}</label>
      <div class="filter-chips">
        <el-badge
          v-for="[key, count] in statUserGroups"
          :key="key"
          :value="count"
          class="item"
          :max="999"
        >
          <el-button
            type="primary"
            :plain="filters?.filterByUserGroups !== key"
            :disabled="!!(filters?.filterByUserGroups && filters?.filterByUserGroups !== key)"
            size="small"
            @click="applyFilter('filterByUserGroups', key)"
          >
            {{ key }}
          </el-button>
        </el-badge>
      </div>
    </div>

    <div v-if="statSelectors.length" class="filter-group">
      <label>{{ $t('logs.filterSelectors') }}</label>
      <div class="filter-chips">
        <el-badge
          v-for="[match, count] in statSelectors"
          :key="match.selectors.join()"
          :value="count"
          class="item"
          :max="999"
        >
          <el-button
            type="warning"
            :plain="filters?.filterBySelectors !== match.selectors.join()"
            :disabled="!!(filters?.filterBySelectors && filters?.filterBySelectors !== match.selectors.join())"
            size="small"
            @click="applyFilter('filterBySelectors', match.selectors.join())"
          >
            {{ match.selectors.join(' ') }}
          </el-button>
        </el-badge>
      </div>
    </div>

    <div v-if="statUsers.length" class="filter-group">
      <label>{{ $t('logs.filterUsers') }}</label>
      <div class="filter-chips">
        <el-badge
          v-for="[key, count] in statUsers.slice(0, 20)"
          :key="key"
          :value="count"
          class="item"
          :max="999"
        >
          <el-button
            type="info"
            :plain="filters?.filterByUsers !== key"
            :disabled="!!(filters?.filterByUsers && filters?.filterByUsers !== key)"
            size="small"
            @click="applyFilter('filterByUsers', key)"
          >
            {{ key }}
          </el-button>
        </el-badge>
        <span v-if="statUsers.length > 20">{{ $t('logs.tags_more') }}</span>
      </div>
    </div>

    <div v-if="statDates.length" class="filter-group">
      <label>{{ $t('logs.filterDates') }}</label>
      <div class="filter-chips">
        <el-badge
          v-for="[key, count] in statDates"
          :key="key"
          :value="count"
          class="item"
          :max="999"
        >
          <el-button
            type="primary"
            :plain="filters?.filterByDate !== key"
            :disabled="!!(filters?.filterByDate && filters?.filterByDate !== key)"
            size="small"
            @click="applyFilter('filterByDate', key)"
          >
            {{ key }}
          </el-button>
        </el-badge>
      </div>
    </div>

    <el-button v-if="hasActiveFilters" link size="small" class="reset-btn" @click="resetAllFilters">
      × {{ $t('logs.resetFilters') }}
    </el-button>
  </aside>
</template>

<style scoped>
.log-filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filters-title {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
  letter-spacing: 0.05em;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: flex-start;
}

.reset-btn {
  align-self: flex-start;
  color: var(--el-color-danger);
  margin-top: 0.25rem;
}
</style>
