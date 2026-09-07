<script setup lang="ts">
import type { InitializedProject } from '~/libs/types'
import ProjectCompo from '~/components/Project.vue'
import { getProject } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    // eslint-disable-next-line e18e/prefer-static-regex -- definePageMeta is a compiler macro, cannot reference outer scope
    return /^[-\w:]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const project: string = params.project as string
const config = useRuntimeConfig()

const { data: projectDetails, status, error } = useAsyncData<InitializedProject>(
  'fetchProject',
  () => getProject(config.public.api, project),
)

watch(error, (err) => {
  if (err) {
    throw createError({ fatal: true })
  }
}, { immediate: true })
</script>

<template>
  <el-main>
    <ProjectCompo v-if="projectDetails" :project="projectDetails" />
    <el-card v-else-if="status === 'pending'" shadow="hover" class="project-card-skeleton">
      <template #header>
        <div class="skeleton-card-header">
          <div class="skeleton-card-left">
            <div class="skeleton-card-info">
              <el-skeleton animated>
                <template #template>
                  <div class="skeleton-header-row">
                    <el-skeleton-item variant="text" style="flex: 1; height: 18px;" />
                    <el-skeleton-item variant="button" style="width: 48px; height: 22px; flex-shrink: 0;" />
                  </div>
                </template>
              </el-skeleton>
            </div>
            <div class="skeleton-card-footer">
              <el-skeleton animated>
                <template #template>
                  <el-skeleton-item variant="text" style="width: 52px; height: 12px;" />
                </template>
              </el-skeleton>
            </div>
          </div>
          <div class="skeleton-card-next" />
        </div>
      </template>
    </el-card>
  </el-main>
</template>

<style scoped>
.project-card-skeleton {
  display: flex;
  flex-direction: column;
}

:deep(.el-card__header) {
  background-color: var(--el-fill-color-lighter);
  padding: 0;
}

:deep(.el-card__body) {
  padding: 0;
}

.skeleton-card-header {
  display: flex;
  flex-direction: row;
}

.skeleton-card-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.skeleton-card-info {
  flex: 1;
  padding: 12px 8px 8px 16px;
}

.skeleton-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-card-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.skeleton-card-next {
  flex-shrink: 0;
  width: 72px;
  border-left: 1px solid var(--el-border-color-lighter);
}
</style>
