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
      <el-row>
        <el-col :span="8">
          <el-statistic
            :title="$t('project.start')"
            :value="new Date(project.date_start).toLocaleDateString(locale)"
          />
        </el-col>
        <el-col :span="8">
          <el-countdown
            :title="$t('project.lastUpdate')"
            :value="Date.now() * 2 - Date.parse(project.date_last_update)"
            format="DD [days] HH:mm"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic
            :title="$t('project.toBeValidated')"
            :value="project.to_be_validated"
          />
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
  },
})
</script>

<style scoped>
:deep(.card-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-col) {
  text-align: center;
}

.title {
  font-weight: 600;
  padding-right: 1em;
}
</style>
