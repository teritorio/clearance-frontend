<template>
  <Layout :user="user">
    <template #header>
      <ProjectLight :project="projectDetails" />
    </template>
    <LogsCompo
      :project="project"
      :user="user"
      :logs="logs"
      @remove-logs="removeLogs($event)"
    />
  </Layout>
</template>

<script setup lang="ts">
import { getUser } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import LogsCompo from '~/components/Logs.vue'
import { getLogs, getProject, Logs, ObjectId, Project } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const project: string = params.project as string

const getUserPromise = getAsyncDataOrNull('fetchUser', () =>
  getUser(useRuntimeConfig().public.API)
)

const getProjectPromise = getAsyncDataOrThrows('fetchProject', () =>
  getProject(useRuntimeConfig().public.API, project)
)

const getLogsPromise = getAsyncDataOrThrows('fetchSettings', () =>
  getLogs(useRuntimeConfig().public.API, project)
)

const [userAsyncData, projectAsyncData, logsAsyncData] = await Promise.all([
  getUserPromise,
  getProjectPromise,
  getLogsPromise,
])
const [user, projectDetails, logs] = [
  userAsyncData?.data,
  projectAsyncData!.data as Ref<Project>,
  logsAsyncData!.data as Ref<Logs>,
]

function removeLogs(objectIds: ObjectId[]) {
  logs.value = logs.value.filter(
    (log) =>
      objectIds.findIndex(
        (objectId) => log.objtype === objectId.objtype && log.id === objectId.id
      ) === -1
  )
}
</script>
