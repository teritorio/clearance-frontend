<template>
  <Layout :user="user">
    <Logs
      v-if="logs"
      :user="user"
      :logs="logs"
      @action="post($event.logAction, $event.objectIds)"
    />
  </Layout>
</template>

<script setup lang="ts">
import { getUser } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { getLogs, LogAction, ObjectId, setLogs } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
  },
})

const params = useRoute().params

const getUserPromise = getAsyncDataOrNull('fetchUser', () =>
  getUser(useRuntimeConfig().public.API)
)

const getLogsPromise = getAsyncDataOrThrows('fetchSettings', () =>
  getLogs(useRuntimeConfig().public.API, params.project as string)
)

const [userAsyncData, logsAsyncData] = await Promise.all([
  getUserPromise,
  getLogsPromise,
])
const [user, logs] = [userAsyncData?.data, logsAsyncData?.data]
const project: string = params.project as string

function post(logAction: LogAction, objectIds: ObjectId) {
  setLogs(useRuntimeConfig().public.API, project, logAction, objectIds).then(
    () => {
      userAsyncData.refresh()
    }
  )
}
</script>
