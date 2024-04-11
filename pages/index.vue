<script setup lang="ts">
import _ from 'underscore'
import type { User } from '~/libs/apiTypes'
import { getUser } from '~/libs/apiTypes'
import {
  getAsyncDataOrNull,
  getAsyncDataOrThrows,
  setAsyncRef,
} from '~/libs/getAsyncData'
import type { Projects } from '~/libs/types'
import { getProjects } from '~/libs/types'

const user = ref<User>()
const myProjects = ref<Projects>()
const otherProjects = ref<Projects>()

getAsyncDataOrNull('fetchUser', () =>
  getUser(useRuntimeConfig().public.API)).then(setAsyncRef(user))

getAsyncDataOrThrows('fetchSettings', () =>
  getProjects(useRuntimeConfig().public.API)).then((data) => {
  const projects = data.data as Ref<Projects>

  const [my, other] = _.partition(
    projects.value,
    (project) => user?.value?.projects.includes(project.id) || false,
  )
  myProjects.value = my
  otherProjects.value = other
})
</script>

<template>
  <Layout :user="user" :back="false">
    <div>
      <h1>{{ $t('app.title') }}</h1>
      <el-row>
        <el-col :span="18">
          <p>
            <i>{{ $t('app.summary') }}</i>
            <br>
            <a href="https://github.com/teritorio/clearance">{{
              $t('app.github')
            }}</a>
          </p>
          <p>
            {{ $t('app.project.new') }}
            <a
              href="https://www.openstreetmap.org/user/frodrigo"
              target="_blank"
            >frodrigo</a>
          </p>
        </el-col>
        <el-col :span="6">
          <img src="/Clearance-process.svg" style="width: 100%">
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
    </div>
  </Layout>
</template>
