<script setup lang="ts">
import type { Validators } from '~/libs/types'
import { Search } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Match {
  name: Record<string, string> | null
  sources: string[]
  user_groups: string[]
  selector_extra: Record<string, null>
  selector_matches: Record<string, unknown>[]
  duplicate_distance: number | null
  icon: null
}

interface ValidatorSettings {
  id: string
  description: string
  global_osm_tags_matches: { matches: Match[] }
  specific_osm_tags_matches: { matches: Match[] }
}

interface ValidatorEntry {
  key: string
  settings: ValidatorSettings
  allMatches: Match[]
  userGroups: string[]
}

const props = defineProps<{
  validators: Validators
}>()

const { locale } = useI18n()

// Build structured entries from the raw Record
const validatorEntries = computed<ValidatorEntry[]>(() => {
  return Object.entries(props.validators).map(([key, value]) => {
    const settings = (value as unknown as { settings: ValidatorSettings }).settings
    const globalMatches: Match[] = settings.global_osm_tags_matches?.matches ?? []
    const specificMatches: Match[] = settings.specific_osm_tags_matches?.matches ?? []
    const allMatches = [...globalMatches, ...specificMatches]

    const userGroupsSet = new Set<string>()
    allMatches.forEach((m) => m.user_groups?.forEach((g) => userGroupsSet.add(g)))

    return {
      key,
      settings,
      allMatches,
      userGroups: Array.from(userGroupsSet).sort(),
    }
  })
})

// Per-validator search and filter state
const searchTexts = ref<Record<string, string>>({})
const selectedGroups = ref<Record<string, string>>({})

function getSearch(key: string): string {
  return searchTexts.value[key] ?? ''
}

function setSearch(key: string, val: string) {
  searchTexts.value[key] = val
}

function getGroup(key: string): string {
  return selectedGroups.value[key] ?? ''
}

function setGroup(key: string, val: string) {
  selectedGroups.value[key] = val
}

function getCategoryLabel(match: Match): string {
  if (match.name) {
    const lang = locale.value // e.g. "fr" or "en"
    // Try exact locale, then fr-FR / en-US variants, then en-US fallback
    const frKey = 'fr-FR'
    const enKey = 'en-US'
    if (lang.startsWith('fr') && match.name[frKey]) {
      return match.name[frKey]
    }
    if (match.name[enKey]) {
      return match.name[enKey]
    }
    // fallback: first available value
    const first = Object.values(match.name)[0]
    if (first) {
      return first
    }
  }
  // No name: use first source
  return match.sources?.[0] ?? '—'
}

const filteredMatchesMap = computed<Map<string, Match[]>>(() => {
  const map = new Map<string, Match[]>()
  for (const entry of validatorEntries.value) {
    const search = getSearch(entry.key).toLowerCase().trim()
    const group = getGroup(entry.key)
    map.set(entry.key, entry.allMatches.filter((m) => {
      if (group && !m.user_groups?.includes(group)) {
        return false
      }
      if (search) {
        const label = getCategoryLabel(m).toLowerCase()
        const inSources = m.sources?.some((s) => s?.toLowerCase().includes(search))
        if (!label.includes(search) && !inSources) {
          return false
        }
      }
      return true
    }))
  }
  return map
})
</script>

<template>
  <div class="validators-root">
    <div
      v-for="entry in validatorEntries"
      :key="entry.key"
      class="validator-section"
    >
      <!-- Control bar -->
      <div class="control-bar">
        <el-input
          :model-value="getSearch(entry.key)"
          clearable
          :placeholder="$t('validators.search')"
          style="width: 280px"
          @update:model-value="(v: string) => setSearch(entry.key, v)"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          :model-value="getGroup(entry.key)"
          clearable
          :placeholder="$t('validators.filterGroup')"
          style="width: 220px"
          @update:model-value="(v: string) => setGroup(entry.key, v)"
        >
          <el-option
            v-for="g in entry.userGroups"
            :key="g"
            :label="g"
            :value="g"
          />
        </el-select>

        <span class="result-count">
          {{ filteredMatchesMap.get(entry.key)?.length }} / {{ entry.allMatches.length }}
        </span>
      </div>

      <!-- Table -->
      <el-table
        :data="filteredMatchesMap.get(entry.key)"
        stripe
        size="small"
        height="600"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <!-- OSM tags -->
              <template v-if="Object.keys(row.selector_extra ?? {}).length > 0">
                <span class="expand-label">{{ $t('validators.osmTags') }} :</span>
                <el-tag
                  v-for="tag in Object.keys(row.selector_extra)"
                  :key="tag"
                  type="warning"
                  size="small"
                  class="expand-chip"
                >
                  {{ tag }}
                </el-tag>
              </template>

              <!-- duplicate_distance -->
              <template v-if="row.duplicate_distance != null">
                <span class="expand-label expand-label--spaced">
                  {{ $t('validators.duplicateDistance') }} :
                </span>
                <el-tag type="danger" size="small">
                  {{ row.duplicate_distance }} m
                </el-tag>
              </template>
            </div>
          </template>
        </el-table-column>

        <!-- Category -->
        <el-table-column
          :label="$t('validators.category')"
          min-width="200"
        >
          <template #default="{ row }">
            {{ getCategoryLabel(row) }}
          </template>
        </el-table-column>

        <!-- Sources -->
        <el-table-column
          :label="$t('validators.sources')"
          min-width="220"
        >
          <template #default="{ row }">
            <el-tag
              v-for="src in (row.sources ?? [])"
              :key="src"
              type="info"
              size="small"
              class="chip"
            >
              {{ src }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Groups -->
        <el-table-column
          :label="$t('validators.groups')"
          min-width="200"
        >
          <template #default="{ row }">
            <span
              v-for="g in [...new Set<string>(row.user_groups ?? [])]"
              :key="g"
              class="group-chip"
            >{{ g }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.validators-root {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.validator-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.result-count {
  margin-left: 4px;
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
  white-space: nowrap;
}

.chip {
  margin-right: 4px;
  margin-bottom: 2px;
}

.group-chip {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 10px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  font-size: 0.75rem;
  white-space: nowrap;
  margin-right: 4px;
  margin-bottom: 2px;
}

.expand-content {
  padding: 8px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.expand-label {
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.expand-label--spaced {
  margin-left: 16px;
}

.expand-chip {
  margin-right: 4px;
}

:deep(.el-table__cell) {
  vertical-align: top;
}
</style>
