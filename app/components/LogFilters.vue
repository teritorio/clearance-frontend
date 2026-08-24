<script setup lang="ts">
import type { Action } from '@teritorio/openstreetmap-logical-history-component'
import type { LocationQuery } from 'vue-router'
import type { ClearanceLoChaData, ClearanceMatch } from '~/composables/useChangesLogs'
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

const groups = (loCha: ClearanceLoChaData) => loCha.metadata.links

const stats = computed(() => {
  const actions = props.loChas
    .flatMap((loCha) =>
      groups(loCha).flatMap((group) =>
        uniq(
          group
            .flatMap((link) => [
              ...Object.values(link.diff_attribs || {}),
              ...Object.values(link.diff_tags || {}),
            ])
            .flat()
            .map((action: Action) => action[0]),
        ),
      ),
    )
  return getStats(actions)
})

const statSelectors = computed(() => {
  const matches = props.loChas.flatMap((loCha) =>
    groups(loCha).flatMap((group) =>
      uniq(group.flatMap((link) => link.matches), (m: ClearanceMatch) => m.selectors.join(';')),
    ),
  )
  return getStats(matches, (m: ClearanceMatch) => m.selectors.join(';'))
})

const statUserGroups = computed(() => {
  const userGroups = props.loChas
    .flatMap((loCha) =>
      groups(loCha).flatMap((group) =>
        uniq(group.flatMap((link) => link.matches.flatMap((m) => m.user_groups))),
      ),
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
  <div class="log-filters">
    <el-select
      v-if="stats.length"
      v-model="selectedAction"
      clearable
      size="default"
      class="filter-select" :class="[{ 'is-active': selectedAction !== null }]"
      :placeholder="$t('logs.filterAction')"
    >
      <template #prefix>
        ⚡
      </template>
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

    <el-select
      v-if="statUserGroups.length"
      v-model="selectedUserGroup"
      clearable
      size="default"
      class="filter-select" :class="[{ 'is-active': selectedUserGroup !== null }]"
      :placeholder="$t('logs.filterUserGroups')"
    >
      <template #prefix>
        📌
      </template>
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

    <el-select
      v-if="statSelectors.length"
      v-model="selectedSelector"
      clearable
      size="default"
      class="filter-select" :class="[{ 'is-active': selectedSelector !== null }]"
      :placeholder="$t('logs.filterSelectors')"
    >
      <template #prefix>
        🏷️
      </template>
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

    <el-select
      v-if="statUsers.length"
      v-model="selectedUser"
      clearable
      size="default"
      class="filter-select" :class="[{ 'is-active': selectedUser !== null }]"
      filterable
      style="width: 150px"
      :placeholder="$t('logs.filterUsers')"
    >
      <template #prefix>
        👤
      </template>
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

    <el-select
      v-if="statDates.length"
      v-model="selectedDate"
      clearable
      size="default"
      class="filter-select" :class="[{ 'is-active': selectedDate !== null }]"
      :placeholder="$t('logs.filterDates')"
    >
      <template #prefix>
        📅
      </template>
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

    <el-button
      v-if="hasActiveFilters"
      link
      size="default"
      class="reset-btn"
      @click="resetAllFilters"
    >
      × {{ $t('logs.resetFilters') }}
    </el-button>
  </div>
</template>

<style scoped>
.log-filters {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select {
  width: auto;
  min-width: 150px;
  max-width: 280px;
}

:deep(.filter-select.is-active .el-select__wrapper) {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.option-count {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-radius: 10px;
  padding: 1px 7px;
  margin-left: 8px;
}

:deep(.el-select-dropdown__item) {
  display: flex;
  align-items: center;
}

:deep(.el-select-dropdown__item.is-selected),
:deep(.el-select-dropdown__item.is-selected:hover) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

:deep(.el-select-dropdown__item.is-selected .option-label),
:deep(.el-select-dropdown__item.is-selected:hover .option-label) {
  color: var(--el-color-primary);
}

.reset-btn {
  color: var(--el-color-danger);
  white-space: nowrap;
}
</style>
