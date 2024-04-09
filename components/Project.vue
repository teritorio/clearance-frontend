<script lang="ts">
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import en from 'dayjs/locale/en-gb'
import fr from 'dayjs/locale/fr'
import es from 'dayjs/locale/es'
import type { Project } from '~/libs/types'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

// Force to import and keep locales
const _daysjsLocale = { en, fr, es }

export default defineNuxtComponent({
  name: 'Project',

  props: {
    project: {
      type: Object as PropType<Project>,
      required: true,
    },
  },

  computed: {
    apiUrl(): string {
      return useRuntimeConfig().public.API
    },
    overpassUrl(): string {
      return `${this.apiUrl}/projects/${this.project.id}/overpasslike/`
    },
    locale(): string {
      return this.$i18n.locale
    },
    lastUpdate(): string {
      return dayjs(this.project.date_last_update)
        .locale(this.$i18n.locale)
        .fromNow()
    },
    toBeValidated(): string | undefined {
      return this.project.to_be_validated?.toLocaleString(this.$i18n.locale)
    },
  },
})
</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>
          <span class="title">{{ $i18nHash(project.title) }}</span>
          <el-tag
            v-for="tag in project.project_tags"
            :key="tag"
            class="item"
            size="small"
          >{{ tag }}</el-tag>
          <br>
          <el-text class="mx-1" type="info">
            {{ $i18nHash(project.description) }}
          </el-text>
        </span>
        <el-button-group>
          <el-button tag="a" :href="`/${project.id}/validators/`">
            {{ $t('project.settings') }}
          </el-button>
          <el-button
            tag="a"
            type="primary"
            :href="`/${project.id}/changes_logs/`"
          >
            {{ $t('project.details') }}
          </el-button>
        </el-button-group>
      </div>
    </template>
    <div>
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
      <el-divider border-style="dotted" />
      <el-row>
        <UserGroups :user-groups="Object.values(project.user_groups)" />
      </el-row>
      <el-row>
        <ul>
          <li>
            {{ $t('project.overpassUrl') }}
            <a :href="overpassUrl">{{ overpassUrl }}</a>
          </li>
          <li>
            {{ $t('project.extract') }}
            <a :href="`${apiUrl}/${project.id}/extract/${project.id}.osm.bz2`">
              {{ `${project.id}.osm.bz2` }}
            </a>
          </li>
          <li>
            <a :href="`${apiUrl}/${project.id}/extract/update/`">{{
              $t('project.diff')
            }}</a>
          </li>
        </ul>
      </el-row>
    </div>
    <p>
      <span>{{ $t('app.project.mainContacts') }}</span>
      <span v-for="user in project.main_contacts" :key="user">
        <a :href="`https://www.openstreetmap.org/user/${user}`" target="_blank">👤&nbsp;{{ user }}</a>
      </span>
    </p>
    <p>{{ $t('app.project.join') }}</p>
  </el-card>
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
