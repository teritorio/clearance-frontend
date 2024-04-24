<script setup lang="ts">
import type { Log, User } from '~/libs/types'

const props = defineProps<{
  logs: Log[]
  projectSlug: string
}>()

defineEmits(['validate'])

const user = useState<User>('user')
const isProjectUser = computed(() => {
  if (!user.value) {
    return false
  }
  return !!user.value.projects?.includes(props.projectSlug)
})

const scrollCount = ref(2)
const lazyLogs = computed(() => props.logs.slice(0, scrollCount.value))
function scrollLoad() {
  scrollCount.value += 2
}
</script>

<template>
  <el-space v-infinite-scroll="scrollLoad" :fill="true" wrap :size="20">
    <log-item
      v-for="log in lazyLogs"
      :key="log.id"
      :log="log"
      :project="projectSlug"
      :project-user="isProjectUser"
      @accept="$emit('validate', $event)"
    />
  </el-space>
</template>
