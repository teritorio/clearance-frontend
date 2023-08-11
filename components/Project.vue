<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>
          {{ project.description.en }}
          <el-tag class="mx-1" size="small">Tourism</el-tag>
        </span>
        <span>{{ project.date_last_update }}</span>
        <span>
          <a class="el-button" :href="`/${slug}/validators/`"> ⚙ Settings </a>
          <a
            class="el-button el-button--primary"
            :href="`/${slug}/changes_logs/`"
          >
            ✓ Data
          </a>
        </span>
      </div>
    </template>
    <div>
      {{ project }}
    </div>
    <div></div>
  </el-card>
</template>

<script lang="ts">
import { Project } from '~/libs/types'

export default defineNuxtComponent({
  name: 'Project',

  props: {
    slug: {
      type: String,
      required: true,
    },
    project: {
      type: Object as PropType<Project>,
      default: null,
    },
  },
})
</script>

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
