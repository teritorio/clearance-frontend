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

function filterModel(queryKey: string) {
  return computed({
    get: () => (filters.value?.[queryKey] as string) ?? null,
    set: async (val: string | null) => {
      const query = val
        ? { ...route.query, [queryKey]: val }
        : Object.fromEntries(Object.entries(route.query).filter(([k]) => k !== queryKey))
      await router.replace({ ...route, query })
    },
  })
}

const selectedAction = filterModel('filterByAction')
const selectedUserGroup = filterModel('filterByUserGroups')
const selectedSelector = filterModel('filterBySelectors')
const selectedUser = filterModel('filterByUsers')
const selectedDate = filterModel('filterByDate')

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
      <el-select v-model="selectedAction" clearable size="small" class="filter-select">
        <el-option
          v-for="[key, count] in stats"
          :key="key"
          :value="key"
          :label="key"
        >
          <span class="option-label">{{ key }}</span>
          <span class="option-count">{{ count }}</span>
        </el-option>
      </el-select>
    </div>

    <div v-if="statUserGroups.length" class="filter-group">
      <label>{{ $t('logs.filterUserGroups') }}</label>
      <el-select v-model="selectedUserGroup" clearable size="small" class="filter-select">
        <el-option
          v-for="[key, count] in statUserGroups"
          :key="key"
          :value="key"
          :label="key"
        >
          <span class="option-label">{{ key }}</span>
          <span class="option-count">{{ count }}</span>
        </el-option>
      </el-select>
    </div>

    <div v-if="statSelectors.length" class="filter-group">
      <label>{{ $t('logs.filterSelectors') }}</label>
      <el-select v-model="selectedSelector" clearable size="small" class="filter-select">
        <el-option
          v-for="[match, count] in statSelectors"
          :key="match.selectors.join()"
          :value="match.selectors.join()"
          :label="match.selectors.join(' ')"
        >
          <span class="option-label">{{ match.selectors.join(' ') }}</span>
          <span class="option-count">{{ count }}</span>
        </el-option>
      </el-select>
    </div>

    <div v-if="statUsers.length" class="filter-group">
      <label>{{ $t('logs.filterUsers') }}</label>
      <el-select v-model="selectedUser" clearable size="small" class="filter-select" filterable>
        <el-option
          v-for="[key, count] in statUsers"
          :key="key"
          :value="key"
          :label="key"
        >
          <span class="option-label">{{ key }}</span>
          <span class="option-count">{{ count }}</span>
        </el-option>
      </el-select>
    </div>

    <div v-if="statDates.length" class="filter-group">
      <label>{{ $t('logs.filterDates') }}</label>
      <el-select v-model="selectedDate" clearable size="small" class="filter-select">
        <el-option
          v-for="[key, count] in statDates"
          :key="key"
          :value="key"
          :label="key"
        >
          <span class="option-label">{{ key }}</span>
          <span class="option-count">{{ count }}</span>
        </el-option>
      </el-select>
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
  gap: 0.3rem;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
}

.filter-select {
  width: 100%;
}

.option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
}

.option-count {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--el-text-color-placeholder);
  margin-left: 6px;
}

:deep(.el-select__wrapper) {
  font-size: 0.85rem;
}

:deep(.el-select-dropdown__item) {
  display: flex;
  align-items: center;
}

.reset-btn {
  align-self: flex-start;
  color: var(--el-color-danger);
  margin-top: 0.25rem;
}
</style>
