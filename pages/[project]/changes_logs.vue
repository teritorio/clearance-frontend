<template>
  <Layout :user="user">
    <Logs v-if="logs" :project="project" :user="user" :logs="logs" />
  </Layout>
</template>

<script setup lang="ts">
import { getUser } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { getLogs } from '~/libs/types'

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

const getLogsPromise = getAsyncDataOrThrows('fetchSettings', () =>
  getLogs(useRuntimeConfig().public.API, project)
)

const [userAsyncData, logsAsyncData] = await Promise.all([
  getUserPromise,
  getLogsPromise,
])
const [user, logs] = [userAsyncData?.data, logsAsyncData?.data]
</script>
