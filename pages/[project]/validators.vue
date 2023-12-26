<template>
  <Layout :user="user">
    <Validators :validators="validators" />
  </Layout>
</template>

<script setup lang="ts">
import { getUser } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { getValidators, Validators as ValidatorsType } from '~/libs/types'

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
const [user, validators] = [
  userAsyncData?.data,
  validatorsAsyncData!.data as Ref<ValidatorsType>,
]
</script>
