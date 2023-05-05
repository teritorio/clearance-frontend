<template>
  <Layout :user="user">
    <div v-if="validators">
      <Validators :validators="validators" />
    </div>
  </Layout>
</template>

<script lang="ts">
import { getUser, User } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { Validators, getValidators } from '~/libs/types'

export default defineNuxtComponent({
  name: 'ValidatorsPage',

  async setup(): Promise<{
    user: Ref<User | null>
    validators: Ref<Validators>
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

    const getValidatorsPromise = getAsyncDataOrThrows('fetchSettings', () =>
      getValidators(useRuntimeConfig().public.API, params.project as string)
    )

    const [user, validators] = await Promise.all([
      getUserPromise,
      getValidatorsPromise,
    ])

    return {
      user,
      validators,
    }
  },
})
</script>
