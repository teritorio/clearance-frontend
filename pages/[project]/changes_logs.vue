<script setup lang="ts">
import {
  getAsyncDataOrThrows,
  setAsyncRef,
} from '~/libs/getAsyncData'
import type { Logs, ObjectId, Project } from '~/libs/types'
import { getLogs, getProject } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const project: string = params.project as string
const projectDetails = ref<Project>()
const logs = ref<Logs>()

getAsyncDataOrThrows('fetchProject', () =>
  getProject(useRuntimeConfig().public.API, project)).then(setAsyncRef(projectDetails))

getAsyncDataOrThrows('fetchSettings', () =>
  getLogs(useRuntimeConfig().public.API, project)).then(setAsyncRef(logs))

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
    <ProjectLight v-if="projectDetails" :project="projectDetails" />
    <Logs
      v-if="logs !== undefined"
      :project="project"
      :logs="logs"
      @remove-logs="removeLogs($event)"
    />
  </div>
</template>
