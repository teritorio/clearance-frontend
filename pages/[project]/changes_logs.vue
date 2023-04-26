<template>
  <Logs
    v-if="logs"
    :logs="logs"
    @action="post($event.logAction, $event.objectIds)"
  />
</template>

<script lang="ts">
import { getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { Logs, getLogs, LogAction, ObjectId, setLogs } from '~/libs/types'

export default defineNuxtComponent({
  name: 'IndexPage',

  async setup(): Promise<{
    project: Ref<string>
    logs: Ref<Logs>
  }> {
    definePageMeta({
      validate({ params }) {
        return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
      },
    })

    const params = useRoute().params

    const getLogsPromise = getAsyncDataOrThrows('fetchSettings', () =>
      getLogs(useRuntimeConfig().public.API, params.project as string)
    )

    const [logs] = await Promise.all([getLogsPromise])

    return {
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
