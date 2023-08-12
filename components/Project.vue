<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>
          <span class="title">{{ project.title.en }}</span>
          <el-tag class="mx-1" size="small">Tourism</el-tag>
          <br />
          <el-text class="mx-1" type="info">{{
            project.description.en
          }}</el-text>
        </span>
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
      <el-row>
        <el-col :span="8">
          <el-statistic title="Start" :value="project.date_start" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="Up to date" :value="project.date_last_update" />
        </el-col>
        <el-col :span="8">
          <el-statistic
            title="To be validated"
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
            Overpass-like API URL : <a :href="overpassUrl">{{ overpassUrl }}</a>
          </li>
          <li>
            Extract
            <a :href="`${apiUrl}/${slug}/extract/${slug}.osm.bz2`">
              {{ `${slug}.osm.bz2` }}
            </a>
            and <a :href="`${apiUrl}/${slug}/extract/update/`">diff</a>
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
