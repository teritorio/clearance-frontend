<script setup lang="ts">
import type { Log, ObjectId, User } from '~/libs/types'

const props = defineProps<{
  projectSlug: string
  logs: Log[]
}>()

defineEmits<{
  (e: 'accept', objectIds: ObjectId[]): void
}>()

const user = useState<User>('user')
const isProjectUser = computed(() => {
  return !!user.value?.projects?.includes(props.projectSlug)
})

const scrollCount = ref<number>(10)
function scrollLoad() {
  scrollCount.value += 10
}

const lazyLogs = computed(() => {
  return props.logs.slice(0, scrollCount.value)
})
</script>

<template>
  <div>
    <el-space v-infinite-scroll="scrollLoad" :fill="true" wrap :size="20">
      <log-item
        v-for="log in lazyLogs"
        :key="log.id"
        :log="log"
        :project="projectSlug"
        :project-user="isProjectUser"
        @accept="$emit('accept', [$event])"
      />
    </el-space>

    <iframe name="hidden_josm_target" style="display: none" />
  </div>
</template>
