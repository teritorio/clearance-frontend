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
  <el-card style="--el-card-bg-color: #FAFAFA;" :body-style="{ padding: 0 }">
    <template #header>
      <div class="card-header">
        <el-text class="mx-1" size="large" tag="b">
          LoCha: {{ item.id }}
        </el-text>
      </div>
    </template>
    <el-space wrap fill style="width: 100%">
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
