<template>
  <Logs v-if="logs" :logs="logs" />
</template>

<script lang="ts">
import Vue from 'vue'
import { Logs, getLogs } from '~/libs/types'

export default Vue.extend({
  name: 'IndexPage',

  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project)
  },

  async asyncData({ params }): Promise<{
    logs: Logs
  }> {
    const getLogsPromise = getLogs(
      `http://localhost:9000/${params.project}/changes_logs/`
    )

    const [logs] = await Promise.all([getLogsPromise])

    return Promise.resolve({
      logs,
    })
  },

  data(): {
    logs: Logs
  } {
    return {
      // @ts-ignore
      logs: null,
    }
  },
})
</script>
