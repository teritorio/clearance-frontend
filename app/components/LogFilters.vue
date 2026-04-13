<script setup lang="ts">
import type { Action } from '@teritorio/openstreetmap-logical-history-component'
import type { LocationQuery } from 'vue-router'
import type { ClearanceApiLink, ClearanceApiResponse, ClearanceMatch } from '~/composables/useChangesLogs'
import { countBy, indexBy, sortBy, uniq } from 'underscore'

const props = defineProps<{
  loChas: ClearanceApiResponse[]
}>()

const route = useRoute()

const filters = ref<LocationQuery>()

watchEffect(() => {
  filters.value = route.query
})

function allLinks(loChas: ClearanceApiResponse[]): ClearanceApiLink[] {
  return loChas.flatMap((loCha) =>
    loCha.metadata.links.flat(),
  )
}

const stats = computed(() => {
  const actions = props.loChas
    .flatMap((loCha) =>
      uniq(
        allLinks([loCha])
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
    uniq(allLinks([loCha]).flatMap((link: ClearanceApiLink) => link.matches)).flat(),
  )
  return getStats(matches, (m: ClearanceMatch) => m.selectors.join(';'))
})

const statUserGroups = computed(() => {
  const userGroups = props.loChas
    .flatMap((loCha) =>
      uniq(allLinks([loCha]).flatMap((link: ClearanceApiLink) => link.matches.flatMap((m) => m.user_groups))),
    )
  return getStats(userGroups)
})

const statUsers = computed(() => {
  const users = props.loChas
    .flatMap((loCha) =>
      uniq(loCha.metadata.changesets.map((changeset) => changeset.user)),
    )
  return getStats(users)
})

const statDates = computed(() => {
  const dates = props.loChas.flatMap((loCha) =>
    loCha.features
      .filter((f) => !f.properties.is_before)
      .map((f) => f.properties.created?.substring(0, 10))
      .filter((d): d is string => !!d),
  )
  return getStats(dates).sort()
})

function getStats<Type>(data: Type[], key: (o: Type) => string = (i) => `${i}`): [Type, number][] {
  const index = indexBy(data, key)
  return sortBy(
    Object.entries(countBy(data, key)) as [string, number][],
    ([_key, count]) => -count,
  ).map(([key, count]) => [index[key]!, count])
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
          {{ key }}
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
          {{ match.selectors.join(' ') }}
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
          {{ key }}
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
          {{ key }}
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
