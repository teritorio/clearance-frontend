<script setup lang="ts">
import type { Action } from '@teritorio/openstreetmap-logical-history-component'
import type { ClearanceLoChaData, ClearanceMatch } from '~/composables/useChangesLogs'
import { countBy, indexBy, sortBy, uniq } from 'underscore'
import { getAfterDates, getAfterUsers } from '~/composables/useChangesLogs'

const props = defineProps<{
  loChas: ClearanceLoChaData[]
}>()

const route = useRoute()
const router = useRouter()

const groups = (loCha: ClearanceLoChaData) => loCha.metadata.links

function getStats<Type>(data: Type[], key: (o: Type) => string = (i) => `${i}`): [Type, number][] {
  const index = indexBy(data, key)
  return sortBy(
    Object.entries(countBy(data, key)) as [string, number][],
    ([_key, count]) => -count,
  ).map(([k, count]) => [index[k]!, count])
}

const statActions = computed(() => {
  const actions = props.loChas.flatMap((loCha) =>
    groups(loCha).flatMap((group) =>
      uniq(
        group.flatMap((link) => [
          ...Object.values(link.diff_attribs || {}),
          ...Object.values(link.diff_tags || {}),
        ]).flat().map((action: Action) => action[0]),
      ),
    ),
  )
  return getStats(actions)
})

const statUserGroups = computed(() => {
  const userGroups = props.loChas.flatMap((loCha) =>
    groups(loCha).flatMap((group) =>
      uniq(group.flatMap((link) => link.matches.flatMap((m) => m.user_groups))),
    ),
  )
  return getStats(userGroups)
})

const statSelectors = computed(() => {
  const matches = props.loChas.flatMap((loCha) =>
    groups(loCha).flatMap((group) =>
      uniq(group.flatMap((link) => link.matches), (m: ClearanceMatch) => m.selectors.join(';')),
    ),
  )
  return getStats(matches, (m: ClearanceMatch) => m.selectors.join(';'))
})

const statUsers = computed(() => getStats(props.loChas.flatMap(getAfterUsers)))

const statDates = computed(() => {
  const dates = props.loChas.flatMap(getAfterDates)
  return getStats(dates).sort()
})

function isActive(queryKey: string, value: string) {
  return route.query[queryKey] === value
}

function isSectionFiltered(queryKey: string) {
  return route.query[queryKey] !== undefined
}

async function toggleFilter(queryKey: string, value: string) {
  const active = isActive(queryKey, value)
  const query = active
    ? Object.fromEntries(Object.entries(route.query).filter(([k]) => k !== queryKey))
    : { ...route.query, [queryKey]: value }
  await router.replace({ ...route, query })
}

type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

const sections = computed(() => [
  { key: 'filterByAction', label: 'Action', icon: '⚡', type: 'danger' as TagType, extraClass: '', items: statActions.value.map(([v, c]) => ({ value: v as string, count: c })) },
  { key: 'filterByUserGroups', label: 'Groups', icon: '📌', type: 'primary' as TagType, extraClass: '', items: statUserGroups.value.map(([v, c]) => ({ value: v as string, count: c })) },
  { key: 'filterBySelectors', label: 'Selectors', icon: '🏷️', type: 'warning' as TagType, extraClass: '', items: statSelectors.value.map(([m, c]) => ({ value: (m as ClearanceMatch).selectors.join(';'), label: (m as ClearanceMatch).selectors.join(' '), count: c })) },
  { key: 'filterByUsers', label: 'Users', icon: '👤', type: 'info' as TagType, extraClass: '', items: statUsers.value.map(([v, c]) => ({ value: v as string, count: c })) },
  { key: 'filterByDate', label: 'Dates', icon: '📅', type: 'info' as TagType, extraClass: 'chip--date', items: statDates.value.map(([v, c]) => ({ value: v as string, count: c })) },
].filter((s) => s.items.length > 0))
</script>

<template>
  <div class="overview-panel">
    <div
      v-for="section in sections"
      :key="section.key"
      class="overview-section"
    >
      <span class="section-label">
        <span class="section-icon">{{ section.icon }}</span>
        {{ section.label }}
      </span>
      <div class="chips">
        <el-badge
          v-for="item in section.items"
          :key="item.value"
          :value="item.count"
          type="danger"
          class="chip-badge"
        >
          <el-tag
            :effect="isActive(section.key, item.value) ? 'dark' : 'plain'"
            :type="section.type"
            class="chip"
            :class="[{ 'chip--active': isActive(section.key, item.value), 'chip--dimmed': isSectionFiltered(section.key) && !isActive(section.key, item.value) }, section.extraClass]"
            @click="toggleFilter(section.key, item.value)"
          >
            {{ 'label' in item ? item.label : item.value }}
          </el-tag>
        </el-badge>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overview-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 1.25rem 10px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);
  flex-shrink: 0;
  max-height: 220px;
  overflow-x: hidden;
  overflow-y: auto;
}

.overview-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
  min-width: 80px;
  padding-top: 4px;
}

.section-icon {
  font-size: 14px;
  flex-shrink: 0;
  line-height: 1;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.chip-badge {
  display: inline-flex;
}

.chip {
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.chip:hover {
  opacity: 0.8;
}

.chip--active {
  font-weight: 600;
}

.chip--dimmed {
  opacity: 0.35;
}

:deep(.el-badge__content) {
  font-size: 10px;
  padding: 0 4px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
}

:deep(.chip--date.el-tag) {
  --el-color-info: #409eff;
  --el-color-info-dark-2: #337ecc;
  --el-color-info-light-3: #79bbff;
  --el-color-info-light-5: #a0cfff;
  --el-color-info-light-7: #c6e2ff;
  --el-color-info-light-8: #d9ecff;
  --el-color-info-light-9: #ecf5ff;
}
</style>
