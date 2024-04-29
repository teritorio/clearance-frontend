<script setup lang="ts">
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import en from 'dayjs/locale/en-gb'
import fr from 'dayjs/locale/fr'
import es from 'dayjs/locale/es'
import type { Project } from '~/libs/types'

const props = defineProps<{
  project: Project
}>()

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

// Force to import and keep locales
const _daysjsLocale = { en, fr, es }

const { locale } = useI18n()
const lastUpdate = computed(() => {
  return dayjs(props.project.date_last_update)
    .locale(locale.value)
    .fromNow()
})

const toBeValidated = computed(() => {
  return props.project.to_be_validated?.toLocaleString(locale.value)
})
</script>

<template>
  <el-row id="stats">
    <el-col :span="12">
      <div class="el-statistic">
        <div class="el-statistic__head">
          {{ $t('project.lastUpdate') }}
        </div>
        <div class="el-statistic__content">
          <span class="el-statistic__number">
            {{ lastUpdate }}
          </span>
        </div>
      </div>
    </el-col>
    <el-col :span="12">
      <div class="el-statistic">
        <div class="el-statistic__head">
          {{ $t('project.toBeValidated') }}
        </div>
        <div class="el-statistic__content">
          <span class="el-statistic__number">
            {{ toBeValidated }}
          </span>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

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
</style>
