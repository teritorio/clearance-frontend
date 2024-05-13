<script setup lang="ts">
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import en from 'dayjs/locale/en-gb'
import fr from 'dayjs/locale/fr'
import es from 'dayjs/locale/es'

const props = defineProps<{
  lastUpdate: string
  toBeValidated?: number
}>()

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

// Force to import and keep locales
const _daysjsLocale = { en, fr, es }

const { locale } = useI18n()
const lastUpdateFormatted = computed(() => {
  return dayjs(props.lastUpdate)
    .locale(locale.value)
    .fromNow()
})
</script>

<template>
  <el-row>
    <el-col :span="12">
      <label>{{ $t('project.lastUpdate') }}</label>
      <time :datetime="lastUpdate">{{ lastUpdateFormatted }}</time>
    </el-col>
    <el-col v-if="toBeValidated !== undefined" :span="12">
      <label>{{ $t('project.toBeValidated') }}</label>
      <data :value="toBeValidated">{{ toBeValidated }}</data>
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
