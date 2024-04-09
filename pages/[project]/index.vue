<script setup lang="ts">
import type { User } from '~/libs/apiTypes'
import { getUser } from '~/libs/apiTypes'
import {
  getAsyncDataOrNull,
  getAsyncDataOrThrows,
  setAsyncRef,
} from '~/libs/getAsyncData'
import ProjectCompo from '~/components/Project.vue'
import type { Project } from '~/libs/types'
import { getProject } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const project: string = params.project as string

const user = ref<User>()
const projectDetails = ref<Project>()

getAsyncDataOrNull('fetchUser', () =>
  getUser(useRuntimeConfig().public.API)).then(setAsyncRef(user))

getAsyncDataOrThrows('fetchProject', () =>
  getProject(useRuntimeConfig().public.API, project)).then(setAsyncRef(projectDetails))
</script>

<template>
  <Layout :user="user">
    <ProjectCompo v-if="projectDetails" :project="projectDetails" />
    <template v-else>
      <div v-loading="true" />
    </template>
  </Layout>
</template>
