<template>
  <Layout :user="user">
    <ProjectCompo :project="projectDetails" />
  </Layout>
</template>

<script setup lang="ts">
import { getUser } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import ProjectCompo from '~/components/Project.vue'
import { getProject, Project } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const project: string = params.project as string

const getUserPromise = getAsyncDataOrNull('fetchUser', () =>
  getUser(useRuntimeConfig().public.API)
)

const getProjectPromise = getAsyncDataOrThrows('fetchProject', () =>
  getProject(useRuntimeConfig().public.API, project)
)

const [userAsyncData, projectAsyncData] = await Promise.all([
  getUserPromise,
  getProjectPromise,
])
const [user, projectDetails] = [
  userAsyncData?.data,
  projectAsyncData!.data as Ref<Project>,
]
</script>
