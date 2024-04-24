<script setup lang="ts">
import {
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
const projectDetails = ref<Project>()

getAsyncDataOrThrows('fetchProject', () =>
  getProject(useRuntimeConfig().public.API, project)).then(setAsyncRef(projectDetails))
</script>

<template>
  <el-main>
    <ProjectCompo v-if="projectDetails" :project="projectDetails" />
  </el-main>
</template>
