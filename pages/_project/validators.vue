<template>
  <div v-if="validators">
    <Validators :validators="validators" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Validators, getValidators } from '~/libs/types'

export default Vue.extend({
  name: 'ValidatorsPage',

  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project)
  },

  async asyncData({ $config, params }): Promise<{
    validators: Validators
  }> {
    const getValidatorsPromise = getValidators($config.API, params.project)

    const [validators] = await Promise.all([getValidatorsPromise])

    return Promise.resolve({
      validators,
    })
  },

  data(): {
    validators: Validators
  } {
    return {
      // @ts-ignore
      validators: null,
    }
  },
})
</script>
