<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>
          <span class="title">{{ project.title.en }}</span>
          <el-tag class="mx-1" size="small">Tourism</el-tag>
          <br />
          <el-text class="mx-1" type="info">
            {{ project.description.en }}
          </el-text>
        </span>
        <span>
          <a class="el-button" :href="`/${slug}/validators/`">
            {{ $t('project.settings') }}
          </a>
          <a
            class="el-button el-button--primary"
            :href="`/${slug}/changes_logs/`"
          >
            {{ $t('project.data') }}
          </a>
        </span>
      </div>
    </template>
    <div>
      <el-row id="stats">
        <el-col :span="8">
          <div class="el-statistic">
            <div class="el-statistic__head">{{ $t('project.start') }}</div>
            <div class="el-statistic__content">
              <span class="el-statistic__number">
                {{ dateStart }}
              </span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="el-statistic">
            <div class="el-statistic__head">{{ $t('project.lastUpdate') }}</div>
            <div class="el-statistic__content">
              <span class="el-statistic__number">
                {{ lastUpdate }}
              </span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
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
      <el-divider border-style="dotted" />
      <el-row>
        <template v-for="(userGroup, key) in project.user_groups" :key="key">
          <UserGroup :user-group="userGroup" />
          &nbsp;&nbsp;&nbsp;
        </template>
      </el-row>
      <el-row>
        <ul>
          <li>
            {{ $t('project.overpassUrl') }}
            <a :href="overpassUrl">{{ overpassUrl }}</a>
          </li>
          <li>
            {{ $t('project.extract') }}
            <a :href="`${apiUrl}/${slug}/extract/${slug}.osm.bz2`">
              {{ `${slug}.osm.bz2` }}
            </a>
          </li>
          <li>
            <a :href="`${apiUrl}/${slug}/extract/update/`">{{
              $t('project.diff')
            }}</a>
          </li>
        </ul>
      </el-row>
    </div>
  </el-card>
</template>

<script lang="ts">
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import en from 'dayjs/locale/en-gb'
import fr from 'dayjs/locale/fr'
import es from 'dayjs/locale/es'
import { Project } from '~/libs/types'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

// Force to import and keep locales
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _daysjsLocale = { en, fr, es }

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

  computed: {
    apiUrl(): string {
      return useRuntimeConfig().public.API
    },
    overpassUrl(): string {
      return `${this.apiUrl}/${this.slug}/overpasslike`
    },
    locale(): string {
      return this.$i18n.locale
    },
    dateStart(): string {
      dayjs.locale(this.$i18n.locale)
      return dayjs(this.project.date_start).format('L')
    },
    lastUpdate(): string {
      return dayjs(this.project.date_last_update)
        .locale(this.$i18n.locale)
        .fromNow()
    },
    toBeValidated(): string {
      return this.project.to_be_validated.toLocaleString(this.$i18n.locale)
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
</style>
