<script setup lang="ts">
import type { LoCha } from '~/libs/types'

const props = defineProps<{
  projectSlug: string
  item: LoCha
}>()

defineEmits<{
  (e: 'accept', id: number): void
}>()

const lochaCount = computed(() => props.item.objects.length)

const user = useUser()
const isProjectUser = computed(() => {
  return !!user.value?.projects?.includes(props.projectSlug)
})
</script>

<template>
  <el-card style="--el-card-bg-color: #FAFAFA;" :body-style="{ padding: 0 }">
    <template v-if="lochaCount > 1 || isProjectUser" #header>
      <div class="card-header">
        <el-text v-if="lochaCount > 1" class="mx-1" size="large" tag="b">
          {{ $t('logs.object_count', { n: lochaCount }) }}
        </el-text>
        <el-button-group v-if="isProjectUser">
          <el-button type="primary" @click="$emit('accept', item.id)">
            ✓
          </el-button>
        </el-button-group>
      </div>
    </template>
    <el-space wrap fill style="width: 100%">
      <log-item
        v-for="(log, i) in item.objects"
        :key="i"
        :log="log"
        :project="projectSlug"
      />
    </el-space>
  </el-card>
</template>
