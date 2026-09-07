<script setup lang="ts">
import type { InitializedProject } from '~/libs/types'
import ProjectCompo from '~/components/Project.vue'
import { getProject } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    // eslint-disable-next-line e18e/prefer-static-regex -- definePageMeta is a compiler macro, cannot reference outer scope
    return /^[-\w:]+$/.test(params.project as string)
  },
})

const params = useRoute().params
const project: string = params.project as string
const config = useRuntimeConfig()

const { data: projectDetails, error } = await useAsyncData<InitializedProject>(
  'fetchProject',
  () => getProject(config.public.api, project),
)

if (error.value) {
  throw createError({ fatal: true })
}
</script>

<template>
  <el-main>
    <ProjectCompo v-if="projectDetails" :project="projectDetails" />
  </el-main>
</template>
