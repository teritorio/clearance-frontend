<script setup lang="ts">
import type {
  Project,
  Validators as ValidatorsType,
} from '~/libs/types'
import {
  getAsyncDataOrThrows,
  setAsyncRef,
} from '~/libs/getAsyncData'
import {
  getProject,
  getValidators,
} from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-\w:]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const project: string = params.project as string
const projectDetails = ref<Project>()
const validators = ref<ValidatorsType>()
const config = useRuntimeConfig()

getAsyncDataOrThrows('fetchProject', () =>
  getProject(config.public.api, project)).then(setAsyncRef(projectDetails))

getAsyncDataOrThrows('fetchValidators', () =>
  getValidators(config.public.api, project)).then(setAsyncRef(validators))
</script>

<template>
  <el-main>
    <project-light v-if="projectDetails" :project="projectDetails" title-tag="h1" />
    <el-divider border-style="dotted" />
    <Validators v-if="validators" :validators="validators" />
  </el-main>
</template>
