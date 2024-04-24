<script setup lang="ts">
import type { Log, ObjectId, Project } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const projectSlug = params.project as string
const project = ref<Project>()
const logs = ref<Log[]>()

try {
  const projectData = await useFetchWithCache<Project>(`project-${projectSlug}`, `${useRuntimeConfig().public.API}/projects/${projectSlug}`)
  project.value = projectData.value
  useState<Project>('project', () => projectData.value)
}
catch (err: any) {
  ElMessage.error(err.message)
}

try {
  const logsData = await useFetchWithCache<Log[]>(`logs-${projectSlug}`, `${useRuntimeConfig().public.API}/projects/${projectSlug}/changes_logs`)
  logs.value = logsData.value
  useState<Log[]>('logs', () => logsData.value)
}
catch (err: any) {
  ElMessage.error(err.message)
}

function removeLogs(objectIds: ObjectId[]) {
  logs.value = logs.value?.filter(
    (log) =>
      objectIds.findIndex(
        (objectId) => log.objtype === objectId.objtype && log.id === objectId.id,
      ) === -1,
  )
}
</script>

<template>
  <div>
    <project-light v-if="project" :project="project" />
    <log-list
      v-if="logs?.length"
      :project="projectSlug"
      :logs="logs"
      @remove-logs="removeLogs($event)"
    />
  </div>
</template>
