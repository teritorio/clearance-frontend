<template>
  <Layout :user="user" :back="false">
    <div>
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
          <p>
            {{ $t('app.project.new') }}
            <a
              href="https://www.openstreetmap.org/user/frodrigo"
              target="_blank"
              >frodrigo</a
            >
          </p>
        </el-col>
        <el-col :span="6">
          <img src="/Clearance-process.svg" style="width: 100%" />
        </el-col>
      </el-row>

      <template v-if="user">
        <h2>{{ $t('page.index.myProjects') }}</h2>
        <template v-if="myProjects.length > 0">
          <el-space :fill="true" wrap :size="20">
            <Project
              v-for="project in myProjects"
              :key="project.id"
              :project="project"
            />
          </el-space>
        </template>
        <el-empty
          v-else
          :description="$t('page.index.empty')"
          :image-size="50"
        />
      </template>
      <h2>{{ $t('page.index.publicProjects') }}</h2>
      <template v-if="otherProjects.length > 0">
        <el-space :fill="true" wrap :size="20">
          <Project
            v-for="project in otherProjects"
            :key="project.id"
            :project="project"
          />
        </el-space>
      </template>
      <el-empty v-else :description="$t('page.index.empty')" :image-size="50" />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import _ from 'underscore'
import { getUser } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { getProjects , Projects } from '~/libs/types'

const getUserPromise = getAsyncDataOrNull('fetchUser', () =>
  getUser(useRuntimeConfig().public.API)
)

const getProjectsPromise = getAsyncDataOrThrows('fetchSettings', () =>
  getProjects(useRuntimeConfig().public.API)
)

const [userAsyncData, projectsAsyncData] = await Promise.all([
  getUserPromise,
  getProjectsPromise,
])

const [user, projects] = [
  userAsyncData?.data,
  projectsAsyncData!.data as Ref<Projects>,
]

// Computed

const [myProjects, otherProjects] = _.partition(
  projects.value,
  (project) => user?.value?.projects.includes(project.id) || false
)
</script>
