<template>
  <Logs v-if="logs" :logs="logs" />
</template>

<script lang="ts">
import Vue from 'vue'
import { Logs, getLogs } from '~/libs/types'

export default Vue.extend({
  name: 'IndexPage',

  data(): {
    logs: Logs
  } {
    return {
      // @ts-ignore
      logs: null,
    }
  },

  async created() {
    const getLogsPromise = getLogs(
      'http://localhost:9000/functions/postgisftw.changes_logs/items.json'
    )

    ;[this.logs] = await Promise.all([getLogsPromise])
  },
})
</script>
