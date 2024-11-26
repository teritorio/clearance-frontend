<script setup lang="ts">
import ProjectCompo from '~/components/Project.vue'
import {
  getAsyncDataOrThrows,
  setAsyncRef,
} from '~/libs/getAsyncData'
import type { Project } from '~/libs/types'
import { getProject } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-\w:]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const project: string = params.project as string
const projectDetails = ref<Project>()
const config = useRuntimeConfig()

getAsyncDataOrThrows('fetchProject', () =>
  getProject(config.public.api, project)).then(setAsyncRef(projectDetails))
</script>

<template>
  <el-main>
    <ProjectCompo v-if="projectDetails" :project="projectDetails" />
  </el-main>
</template>
