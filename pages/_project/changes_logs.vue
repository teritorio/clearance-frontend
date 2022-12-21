<template>
  <Logs
    v-if="logs"
    :logs="logs"
    @action="post($event.logAction, $event.objectIds)"
  />
</template>

<script lang="ts">
import Vue from 'vue'
import { Logs, getLogs, LogAction, ObjectId, setLogs } from '~/libs/types'

export default Vue.extend({
  name: 'IndexPage',

  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project)
  },

  async asyncData({ params }): Promise<{
    project: string
    logs: Logs
  }> {
    const getLogsPromise = getLogs('http://localhost:9000', params.project)

    const [logs] = await Promise.all([getLogsPromise])

    return Promise.resolve({
      project: params.project,
      logs,
    })
  },

  data(): {
    project: string
    logs: Logs
  } {
    return {
      // @ts-ignore
      project: null,
      // @ts-ignore
      logs: null,
    }
  },

  methods: {
    post(logAction: LogAction, objectIds: ObjectId) {
      setLogs('http://localhost:9000', this.project, logAction, objectIds)
    },
  },
})
</script>
