<script setup lang="ts">
import type { User } from '~/libs/apiTypes'
import { getUser } from '~/libs/apiTypes'
import {
  getAsyncDataOrNull,
  getAsyncDataOrThrows,
  setAsyncRef,
} from '~/libs/getAsyncData'
import LogsCompo from '~/components/Logs.vue'
import type { Logs, ObjectId, Project } from '~/libs/types'
import { getLogs, getProject } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const project: string = params.project as string

const user = ref<User>()
const projectDetails = ref<Project>()
const logs = ref<Logs>()

getAsyncDataOrNull('fetchUser', () =>
  getUser(useRuntimeConfig().public.API)).then(setAsyncRef(user))

getAsyncDataOrThrows('fetchProject', () =>
  getProject(useRuntimeConfig().public.API, project)).then(setAsyncRef(projectDetails))

getAsyncDataOrThrows('fetchSettings', () =>
  getLogs(useRuntimeConfig().public.API, project)).then(setAsyncRef(logs))

function removeLogs(objectIds: ObjectId[]) {
  logs.value = logs.value?.filter(
    log =>
      objectIds.findIndex(
        objectId => log.objtype === objectId.objtype && log.id === objectId.id,
      ) === -1,
  )
}
</script>

<template>
  <Layout :user="user">
    <template #header>
      <ProjectLight v-if="projectDetails" :project="projectDetails" />
      <template v-else>
        <div v-loading="true" />
      </template>
    </template>
    <LogsCompo
      v-if="logs !== undefined"
      :project="project"
      :user="user"
      :logs="logs"
      @remove-logs="removeLogs($event)"
    />
    <template v-else>
      <div v-loading="true" />
    </template>
  </Layout>
</template>
