<script setup lang="ts">
import type { Log, ObjType } from '~/libs/types'

const props = defineProps<{
  projectSlug: string
  logs: Log[]
}>()

defineEmits<{
  (e: 'accept', id: { id: number, objtype: ObjType }): void
}>()

const user = useUser()
const isProjectUser = computed(() => {
  return !!user.value?.projects?.includes(props.projectSlug)
})
</script>

<template>
  <div>
    <el-card>
      <log-item
        v-for="log in logs"
        :key="log.id"
        :log="log"
        :project="projectSlug"
        :project-user="isProjectUser"
        @accept="$emit('accept', $event)"
      />
    </el-card>
  </div>
</template>
