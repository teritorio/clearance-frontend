<template>
  <span>
    <span class="title">{{ project.title.en }}</span>
    <el-tag
      v-for="tag in project.project_tags"
      :key="tag"
      class="item"
      size="small"
      >{{ tag }}</el-tag
    >
    <br />
    <el-text class="mx-1" type="info">
      {{ project.description.en }}
    </el-text>
  </span>
  <el-button-group>
    <el-button tag="a" :href="`/${project.id}/validators/`">
      {{ $t('project.settings') }}
    </el-button>
    <el-button tag="a" :href="`/${project.id}`">
      {{ $t('project.details') }}
    </el-button>
  </el-button-group>
</template>

<script lang="ts">
import { Project } from '~/libs/types'

export default defineNuxtComponent({
  name: 'Project',

  props: {
    project: {
      type: Object as PropType<Project>,
      required: true,
    },
  },
})
</script>

<style scoped>
#stats .el-col {
  text-align: center;
}

#stats .el-statistic {
  --el-statistic-title-font-weight: 400;
  --el-statistic-title-font-size: var(--el-font-size-extra-small);
  --el-statistic-title-color: var(--el-text-color-regular);
  --el-statistic-content-font-weight: 400;
  --el-statistic-content-font-size: var(--el-font-size-extra-large);
  --el-statistic-content-color: var(--el-text-color-primary);
}

#stats .el-statistic__head {
  font-weight: var(--el-statistic-title-font-weight);
  font-size: var(--el-statistic-title-font-size);
  color: var(--el-statistic-title-color);
  line-height: 20px;
  margin-bottom: 4px;
}

#stats .el-statistic__content {
  font-weight: var(--el-statistic-content-font-weight);
  font-size: var(--el-statistic-content-font-size);
  color: var(--el-statistic-content-color);
}

:deep(.card-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: 600;
  padding-right: 1em;
}

.item {
  margin-top: 0.7em;
  margin-right: 1.3em;
}
</style>
