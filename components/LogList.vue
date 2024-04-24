<script setup lang="ts">
import type { Log, ObjectId, User } from '~/libs/types'
import { setLogs } from '~/libs/types'

const props = defineProps<{
  project: string
  logs: Log[]
}>()

const emit = defineEmits<{
  (e: 'removeLogs', objectIds: ObjectId[]): void
}>()

const scrollCount = ref<number>(10)

const user = useState<User>('user')
const isProjectUser = computed(() => {
  return !!user.value?.projects?.includes(props.project)
})

function accept(objectIds: ObjectId[]) {
  setLogs(useRuntimeConfig().public.API, props.project, 'accept', objectIds)
    .then(() => emit('removeLogs', objectIds))
    .catch((error) => {
      /* eslint no-alert: 0 */
      alert(error)
    })
}

function scrollLoad() {
  scrollCount.value += 10
}
</script>

<template>
  <div>
    <el-space v-infinite-scroll="scrollLoad" :fill="true" wrap :size="20">
      <log-item
        v-for="log in (logs || []).slice(0, scrollCount + 1)"
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
