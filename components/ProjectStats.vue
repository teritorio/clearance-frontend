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
  <el-row>
    <el-col :span="12">
      <label>{{ $t('project.lastUpdate') }}</label>
      <time :datetime="props.project.date_last_update">{{ lastUpdate }}</time>
    </el-col>
    <el-col :span="12">
      <label>{{ $t('project.toBeValidated') }}</label>
      <data :value="props.project.to_be_validated">{{ toBeValidated }}</data>
    </el-col>
  </el-row>
</template>

<style scoped>
.el-col {
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
}

label {
  color: #606266;
  font-size: 12px;
  line-height: 20px;
  margin-bottom: 4px;
}

time,
data {
  color: #303133;
  font-size: 20px;
}
</style>
