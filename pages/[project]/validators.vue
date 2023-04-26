<template>
  <div v-if="validators">
    <Validators :validators="validators" />
  </div>
</template>

<script lang="ts">
import { getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { Validators, getValidators } from '~/libs/types'

export default defineNuxtComponent({
  name: 'ValidatorsPage',

  async setup(): Promise<{
    validators: Ref<Validators>
  }> {
    definePageMeta({
      validate({ params }) {
        return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
      },
    })

    const params = useRoute().params

    const getValidatorsPromise = getAsyncDataOrThrows('fetchSettings', () =>
      getValidators(useRuntimeConfig().public.API, params.project as string)
    )

    const [validators] = await Promise.all([getValidatorsPromise])

    return {
      validators,
    }
  },
})
</script>
