<script setup lang="ts">
import type { Log, ObjectId, User } from '~/libs/types'

const props = defineProps<{
  project: string
  logs: Log[]
}>()

defineEmits<{
  (e: 'accept', objectIds: ObjectId[]): void
}>()

const scrollCount = ref<number>(10)

const user = useState<User>('user')
const isProjectUser = computed(() => {
  return !!user.value?.projects?.includes(props.project)
})

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
        @accept="$emit('accept', [$event])"
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
