<script setup lang="ts">
import {
  getAsyncDataOrThrows,
  setAsyncRef,
} from '~/libs/getAsyncData'
import type {
  Project,
  Validators as ValidatorsType,
} from '~/libs/types'
import {
  getProject,
  getValidators,
} from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const project: string = params.project as string
const projectDetails = ref<Project>()
const validators = ref<ValidatorsType>()

getAsyncDataOrThrows('fetchProject', () =>
  getProject(useRuntimeConfig().public.API, project)).then(setAsyncRef(projectDetails))

getAsyncDataOrThrows('fetchValidators', () =>
  getValidators(useRuntimeConfig().public.API, project)).then(setAsyncRef(validators))
</script>

<template>
  <div>
    <ProjectLight v-if="projectDetails" :project="projectDetails" />
    <Validators v-if="validators" :validators="validators" />
  </div>
</template>
