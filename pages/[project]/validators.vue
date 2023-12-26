<template>
  <Layout :user="user">
    <template #header>
      <ProjectLight v-if="projectDetails" :project="projectDetails" />
      <template v-else>
        <div v-loading="true"></div>
      </template>
    </template>
    <Validators v-if="validators" :validators="validators" />
    <template v-else>
      <div v-loading="true"></div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { getUser, User } from '~/libs/apiTypes'
import {
  getAsyncDataOrNull,
  getAsyncDataOrThrows,
  setAsyncRef,
} from '~/libs/getAsyncData'
import {
  getProject,
  getValidators,
  Project,
  Validators as ValidatorsType,
} from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const project: string = params.project as string

const user = ref<User>()
const projectDetails = ref<Project>()
const validators = ref<ValidatorsType>()

getAsyncDataOrNull('fetchUser', () =>
  getUser(useRuntimeConfig().public.API)
).then(setAsyncRef(user))

getAsyncDataOrThrows('fetchProject', () =>
  getProject(useRuntimeConfig().public.API, project)
).then(setAsyncRef(projectDetails))

getAsyncDataOrThrows('fetchValidators', () =>
  getValidators(useRuntimeConfig().public.API, project)
).then(setAsyncRef(validators))
</script>
