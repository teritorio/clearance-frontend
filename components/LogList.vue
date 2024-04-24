<script setup lang="ts">
import { countBy, indexBy, intersection, sortBy, uniq } from 'underscore'
import type { Geometry } from 'geojson'
import type { Log, ObjectId, User } from '~/libs/types'
import { setLogs } from '~/libs/types'

const props = defineProps<{
  project: string
  logs: Log[]
}>()

const emit = defineEmits<{
  (e: 'removeLogs', objectIds: ObjectId[]): void
}>()

const route = useRoute()
const filterByAction = ref<string | undefined>(route.query.filterByAction as string)
const filterByUserGroups = ref<string | undefined>(route.query.filterByUserGroups as string)
const filterBySelectors = ref<string[] | undefined>(route.query.filterByUserGroups as string[])
const filterByUsers = ref<string | undefined>(route.query.filterByUsers as string)
const filterByDate = ref<string | undefined>(route.query.filterByDate as string)
const scroolCount = ref<number>(10)

const stats = computed(() => {
  const actions = props.logs
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
  const matches = props.logs.map((log) => uniq(log.matches).flat()).flat(1)
  return getStats(matches, (m) => m.selectors.join(';'))
})

const statUserGroups = computed(() => {
  const userGroups = props.logs
    .map((log) => uniq(log.matches.map((m) => m.user_groups).flat(2)))
    .flat(1)
  return getStats(userGroups)
})

const statUsers = computed(() => {
  const users = props.logs
    .map((log) =>
      (log.base ? log.changesets.slice(1) : log.changesets).map(
        (changeset) => changeset.user,
      ),
    )
    .flat(2)
  return getStats(users)
})

const statDates = computed(() => {
  const dates = props.logs.map((log) => log.change.created.substring(0, 10))
  return getStats(dates).sort()
})

const logsWithFilter = computed(() => {
  return props.logs.filter((log) => {
    const changesetsUsers
      = filterByUsers.value !== undefined
      && uniq(
        (log.base ? log.changesets.slice(1) : log.changesets).map(
          (changeset) => changeset.user,
        ),
      )
    return (
      (filterByAction.value === undefined
      || Object.values(log.diff_attribs || {})
        .concat(Object.values(log.diff_tags || {}))
        .some(
          (actions) =>
            actions?.some(
              (action) => action[0] === filterByAction.value,
            ) || false,
        ))
        && (filterByUserGroups.value === undefined
        || log.matches.some((match) =>
          match.user_groups.includes(filterByUserGroups.value!),
        ))
        && (filterBySelectors.value === undefined
        || log.matches.some((match) =>
          matchFilterBySelectors(match.selectors),
        ))
        && (filterByUsers.value === undefined
        || (changesetsUsers
        && changesetsUsers.length === 1
        && changesetsUsers[0] === filterByUsers.value))
        && (filterByDate.value === undefined
        || log.change.created.substring(0, 10) === filterByDate.value)
    )
  })
})

const user = useState<User>('user')
const isProjectUser = computed(() => {
  return !!user.value?.projects?.includes(props.project)
})

const baseGeoms = computed(() => {
  return props.logs
    .map((log) => log.base?.geom)
    .filter((geom): geom is Geometry => !!geom)
})

const changeGeoms = computed(() => {
  return props.logs.map((log) => log.change.geom)
})

watch(route.query, updateUrl)

function getStats<Type>(data: Type[], key: (o: Type) => string = (i) => `${i}`): [Type, number][] {
  const index = indexBy(data, key)
  return sortBy(
    Object.entries(countBy(data, key)) as [string, number][],
    ([_key, count]) => -count,
  ).map(([key, count]) => [index[key], count])
}

function accept(objectIds: ObjectId[]) {
  setLogs(useRuntimeConfig().public.API, props.project, 'accept', objectIds)
    .then(() => emit('removeLogs', objectIds))
    .catch((error) => {
      /* eslint no-alert: 0 */
      alert(error)
    })
}

function accept_selection() {
  const objectIds = logsWithFilter.value.map((log) => ({
    objtype: log.objtype,
    id: log.id,
    version: log.change.version,
    deleted: log.change.deleted,
  }))
  accept(objectIds)
}

function reset_filter() {
  filterByAction.value = undefined
  filterByUserGroups.value = undefined
  filterBySelectors.value = undefined
  filterByUsers.value = undefined
  filterByDate.value = undefined
}

function validate_selection() {
  accept_selection()
  reset_filter()
}

function scroolLoad() {
  scroolCount.value += 10
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
  return (
    filterBySelectors.value !== undefined
    && intersection(selectors, filterBySelectors.value).length > 0
  )
}
</script>

<template>
  <div>
    <el-row>
      <diff-map
        :base-geom="baseGeoms"
        :change-geom="changeGeoms"
        style="resize: vertical"
      />
    </el-row>
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

    <el-button-group
      v-if="
        isProjectUser
          && (filterByAction
            || filterByUserGroups
            || filterBySelectors
            || filterByUsers
            || filterByDate)
      "
    >
      <el-button type="primary" @click="validate_selection()">
        ✓ {{ $t('logs.validate_selection') }}
      </el-button>
    </el-button-group>

    <h3>{{ $t('logs.data') }}</h3>
    <p>{{ $t('logs.data_details') }}</p>
    <ul>
      <li>{{ $t('logs.data_details_osm') }}</li>
      <li>{{ $t('logs.data_details_manual') }}</li>
    </ul>

    <el-space v-infinite-scroll="scroolLoad" :fill="true" wrap :size="20">
      <log-item
        v-for="log in (logsWithFilter || []).slice(0, scroolCount + 1)"
        :key="log.id"
        :log="log"
        :project="project"
        :project-user="isProjectUser"
        @accept="accept([$event])"
      />
    </el-space>

    <iframe name="hidden_josm_target" style="display: none" />
  </div>
</template>

<style scoped>
.item {
  margin-top: 0.7em;
  margin-right: 1.3em;
}
</style>
