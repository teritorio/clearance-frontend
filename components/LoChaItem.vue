<script setup lang="ts">
import type { LoCha, ObjType } from '~/libs/types'

const props = defineProps<{
  projectSlug: string
  item: LoCha
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
  <el-card>
    <template #header>
      <div class="card-header">
        {{ item.id }}
      </div>
    </template>
    <el-space direction="vertical" :fill="true">
      <log-item
        v-for="log in item.objects"
        :key="log.id"
        :log="log"
        :project="projectSlug"
        :project-user="isProjectUser"
        @accept="$emit('accept', $event)"
      />
    </el-space>
  </el-card>
</template>
