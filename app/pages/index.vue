<script setup lang="ts">
import type { InitializedProject, Project, UninitializedProject } from '~/libs/types'
import _ from 'underscore'
import { isInitializedProject } from '~/libs/types'

const admin = useAdmin()
const user = useUser()
const projects = useProjects()
const myProjects = ref<InitializedProject[]>()
const otherProjects = ref<InitializedProject[]>()
const uninitializedProjects = ref<UninitializedProject[]>()

const [initialized, uninitialized] = _.partition(
  projects.value,
  (project: Project) => isInitializedProject(project),
)
uninitializedProjects.value = uninitialized as UninitializedProject[]

const [my, other] = _.partition(
  initialized as InitializedProject[],
  (project: InitializedProject) => user.value?.projects.includes(project.id) || false,
)
myProjects.value = my
otherProjects.value = other
</script>

<template>
  <el-main>
    <el-container direction="vertical">
      <h1>{{ $t('app.title') }}</h1>
      <el-row>
        <el-col :span="18">
          <p>
            <i>{{ $t('app.summary') }}</i>
            <br />
            <a href="https://github.com/teritorio/clearance">{{
              $t('app.github')
            }}</a>
          </p>
          <p v-if="admin">
            {{ $t('app.project.new') }}
            <a
              :href="`https://www.openstreetmap.org/user/${encodeURIComponent(admin)}`"
              target="_blank"
            >{{ admin }}</a>
          </p>
        </el-col>
        <el-col :span="6">
          <img src="/Clearance-process.svg" style="width: 100%" />
        </el-col>
      </el-row>

      <template v-if="myProjects !== undefined && myProjects?.length > 0">
        <h2>{{ $t('page.index.myProjects') }}</h2>
        <el-space :fill="true" wrap :size="20">
          <Project
            v-for="project in myProjects"
            :key="project.id"
            :project="project"
          />
        </el-space>
      </template>

      <h2>{{ $t('page.index.publicProjects') }}</h2>

      <template v-if="otherProjects === undefined">
        <el-empty
          v-loading="true"
          :description="$t('page.index.empty')"
          :image-size="50"
        />
      </template>

      <template v-else-if="otherProjects.length > 0">
        <el-space :fill="true" wrap :size="20">
          <Project
            v-for="project in otherProjects"
            :key="project.id"
            :project="project"
          />
        </el-space>
      </template>

      <el-empty v-else :description="$t('page.index.empty')" :image-size="50" />

      <template v-if="uninitializedProjects?.length">
        <h2>{{ $t('page.index.uninitializedProjects') }}</h2>
        <ul>
          <li v-for="project in uninitializedProjects" :key="project.id">
            {{ project.id }}
          </li>
        </ul>
      </template>
    </el-container>
  </el-main>
</template>
