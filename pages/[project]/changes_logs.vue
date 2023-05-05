<template>
  <Layout :user="user">
    <Logs
      v-if="logs"
      :logs="logs"
      @action="post($event.logAction, $event.objectIds)"
    />
  </Layout>
</template>

<script lang="ts">
import { getUser, User } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { Logs, getLogs, LogAction, ObjectId, setLogs } from '~/libs/types'

export default defineNuxtComponent({
  name: 'IndexPage',

  async setup(): Promise<{
    user: Ref<User | null>
    project: Ref<string>
    logs: Ref<Logs>
  }> {
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

    const [user, logs] = await Promise.all([getUserPromise, getLogsPromise])

    return {
      user,
      project: ref(params.project as string),
      logs,
    }
  },

  methods: {
    post(logAction: LogAction, objectIds: ObjectId) {
      setLogs(this.$config.API, this.project, logAction, objectIds)
    },
  },
})
</script>
