<script setup lang="ts">
import type { User } from '~/libs/types'
import { userLogout } from '~/libs/apiTypes'

withDefaults(defineProps<{
  user?: User | null
}>(), {
  user: null,
})

const form = useTemplateRef<HTMLFormElement>('form')

const { public: { api } } = useRuntimeConfig()

const loginUrl = computed(() => `${api}../../../users/auth/osm_oauth2`)

function submit(): void {
  form.value?.submit()
}

function logout(): void {
  userLogout(api)
}
</script>

<template>
  <form v-if="!user" ref="form" :action="loginUrl" method="post">
    <el-button type="primary" @click="submit">
      {{ $t('user.login') }}
    </el-button>
  </form>
  <template v-else>
    <el-avatar :src="user.osm_image_url">
      {{ user.osm_name }}
    </el-avatar>
    <span>{{ user.osm_name }}</span>
    <el-button @click="logout">
      {{ $t('user.logout') }}
    </el-button>
  </template>
</template>
