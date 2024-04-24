<script setup lang="ts">
import { countBy, indexBy, intersection, sortBy, uniq } from 'underscore'
import type { Log } from '~/libs/types'

const route = useRoute()
const filterByAction = ref<string | undefined>(route.query.filterByAction as string)
const filterByUserGroups = ref<string | undefined>(route.query.filterByUserGroups as string)
const filterBySelectors = ref<string[] | undefined>(route.query.filterByUserGroups as string[])
const filterByUsers = ref<string | undefined>(route.query.filterByUsers as string)
const filterByDate = ref<string | undefined>(route.query.filterByDate as string)

const logs = useState<Log[]>('logs')
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
      (log.base ? log.changesets.slice(1) : log.changesets).map(
        (changeset) => changeset.user,
      ),
    )
    .flat(2)
  return getStats(users)
})

const statDates = computed(() => {
  const dates = logs.value.map((log) => log.change.created.substring(0, 10))
  return getStats(dates).sort()
})

watch(route.query, updateUrl)

function getStats<Type>(data: Type[], key: (o: Type) => string = (i) => `${i}`): [Type, number][] {
  const index = indexBy(data, key)
  return sortBy(
    Object.entries(countBy(data, key)) as [string, number][],
    ([_key, count]) => -count,
  ).map(([key, count]) => [index[key], count])
}

const router = useRouter()
function updateUrl() {
  router.replace({
    name: route.name || undefined,
    query: {
      ...route.query,
      filterByAction: filterByAction.value,
      filterByUserGroups: filterByUserGroups.value,
      filterBySelectors: filterBySelectors.value,
      filterByUsers: filterByUsers.value,
      filterByDate: filterByDate.value,
    },
  })
}

function matchFilterBySelectors(selectors: string[]) {
  return filterBySelectors.value !== undefined && intersection(selectors, filterBySelectors.value).length > 0
}
</script>

<template>
  <aside>
    <h3>{{ $t('logs.filters') }}</h3>
    <el-row style="margin-top: 20px">
      <el-badge :value="logs.length" class="item" :max="999">
        <el-tag size="small">
          {{ $t('logs.objects') }}
        </el-tag>
      </el-badge>
      <el-badge
        v-for="[key, count] in stats"
        :key="key"
        :value="count"
        class="item"
        :max="999"
      >
        <el-button
          type="danger"
          :plain="filterByAction !== key"
          :disabled="(filterByAction && filterByAction !== key) || false"
          size="small"
          @click="filterByAction = filterByAction !== key ? key : undefined"
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
          :plain="filterByUserGroups !== key"
          :disabled="(filterByUserGroups && filterByUserGroups !== key) || false"
          size="small"
          @click="
            filterByUserGroups = filterByUserGroups !== key ? key : undefined
          "
        >
          📌 {{ key }}
        </el-button>
      </el-badge>
    </el-row>
    <el-row>
      <el-badge
        v-for="[match, count] in statSelectors"
        :key="match.selectors.join(';')"
        :value="count"
        class="item"
        :max="999"
      >
        <el-button
          type="warning"
          :plain="filterBySelectors !== match.selectors"
          :disabled="
            (filterBySelectors && !matchFilterBySelectors(match.selectors))
              || false
          "
          size="small"
          @click="
            filterBySelectors = !matchFilterBySelectors(match.selectors)
              ? match.selectors
              : undefined
          "
        >
          🏷️ {{ $i18nHash(match.name) || match.selectors.join(' ') }}
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
          :plain="filterByUsers !== key"
          :disabled="(filterByUsers && filterByUsers !== key) || false"
          size="small"
          @click="filterByUsers = filterByUsers !== key ? key : undefined"
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
          :plain="filterByDate !== key"
          :disabled="(filterByDate && filterByDate !== key) || false"
          size="small"
          @click="filterByDate = filterByDate !== key ? key : undefined"
        >
          📅 {{ key }}
        </el-button>
      </el-badge>
    </el-row>
  </aside>
</template>
