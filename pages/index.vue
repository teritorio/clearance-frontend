<template>
  <Layout :user="user">
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
          <Project
            v-for="[key, project] in myProjects || []"
            :key="key"
            :slug="key"
            :project="project"
          />
        </template>
        <el-empty
          v-else
          :description="$t('page.index.empty')"
          :image-size="50"
        />
      </template>
      <h2>{{ $t('page.index.publicProjects') }}</h2>
      <template v-if="otherProjects.length > 0">
        <Project
          v-for="[key, project] in otherProjects || []"
          :key="key"
          :slug="key"
          :project="project"
        />
      </template>
      <el-empty v-else :description="$t('page.index.empty')" :image-size="50" />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import _ from 'underscore'
import { getUser } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { getProjects } from '~/libs/types'
import Project from '~/components/Project.vue'

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

const [user, projects] = [userAsyncData!.data, projectsAsyncData!.data]

// Computed

const [myProjects, otherProjects] = _.partition(
  Object.entries(projects.value!),
  ([_key, project]) => {
    return !!Object.values(project.user_groups).find(
      (userGroup) =>
        user?.value?.osm_name && userGroup.users.includes(user?.value?.osm_name)
    )
  }
)
</script>
