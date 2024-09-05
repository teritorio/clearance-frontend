<script setup lang="ts">
import { countBy, indexBy, sortBy, uniq } from 'underscore'
import type { LocationQuery } from 'vue-router'

const route = useRoute()
const filters = ref<LocationQuery>()
watchEffect(() => {
  filters.value = route.query
})

const logs = useLogs()

const stats = computed(() => {
  const actions = logs.value
    .map((log) =>
      uniq(
        [
          ...Object.values(log.diff_attribs || {}),
          ...Object.values(log.diff_tags || {}),
        ]
          .flat(1)
          .map((action) => action[0]),
      ),
    )
    .flat(1)
  return getStats(actions)
})

const statSelectors = computed(() => {
  const matches = logs.value.map((log) => uniq(log.matches).flat()).flat(1)
  return getStats(matches, (m) => m.selectors.join(';'))
})

const statUserGroups = computed(() => {
  const userGroups = logs.value
    .map((log) => uniq(log.matches.map((m) => m.user_groups).flat(2)))
    .flat(1)
  return getStats(userGroups)
})

const statUsers = computed(() => {
  const users = logs.value
    .map((log) =>
      uniq(
        (log.changesets ? log.base ? log.changesets.slice(1) : log.changesets : []).map(
          (changeset) => changeset.user,
        ),
      ),
    )
    .flat(2)
  return getStats(users)
})

const statDates = computed(() => {
  const dates = logs.value.map((log) => log.change.created.substring(0, 10))
  return getStats(dates).sort()
})

function getStats<Type>(data: Type[], key: (o: Type) => string = (i) => `${i}`): [Type, number][] {
  const index = indexBy(data, key)
  return sortBy(
    Object.entries(countBy(data, key)) as [string, number][],
    ([_key, count]) => -count,
  ).map(([key, count]) => [index[key], count])
}

const router = useRouter()
async function applyFilter(key: string, value: string) {
  const query = filters.value?.[key] === value
    ? Object.fromEntries(Object.entries(route.query).filter(([k, _v]) => k !== key))
    : { ...route.query, [key]: value }
  await router.replace({ ...route, query })
}
</script>

<template>
  <aside>
    <h3>{{ $t('logs.filters') }}</h3>
    <el-row style="margin-top: 20px">
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
    </el-row>
    <el-row>
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
          📌 {{ key }}
        </el-button>
      </el-badge>
    </el-row>
    <el-row>
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
          🏷️ {{ useI18nHash(match.name) || match.selectors.join(' ') }}
        </el-button>
      </el-badge>
    </el-row>
    <el-row>
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
          👤 {{ key }}
        </el-button>
      </el-badge>
      <span v-if="statUsers.length > 20">{{ $t('logs.tags_more') }}</span>
    </el-row>
    <el-row>
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
          📅 {{ key }}
        </el-button>
      </el-badge>
    </el-row>
  </aside>
</template>

<style scoped>
.item {
  margin-top: 0.7em;
  margin-right: 1.3em;
}
</style>
