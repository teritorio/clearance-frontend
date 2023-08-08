<template>
  <Layout :user="user">
    <div v-if="validators">
      <Validators :validators="validators" />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { getUser } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { getValidators } from '~/libs/types'

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

const [userAsyncData, validatorsAsyncData] = await Promise.all([
  getUserPromise,
  getValidatorsPromise,
])
const [user, validators] = [userAsyncData?.data, validatorsAsyncData?.data]
</script>
