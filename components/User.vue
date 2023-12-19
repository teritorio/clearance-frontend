<template>
  <form v-if="!user" :action="loginUrl" method="post">
    <button type="submit">{{ $t('user.login') }}</button>
  </form>
  <template v-else>
    <el-avatar :src="user.osm_image_url">
      {{ user.osm_name }}
    </el-avatar>
    <span>{{ user.osm_name }}</span>
    <button @click="logout">{{ $t('user.logout') }}</button>
  </template>
</template>

<script lang="ts">
import { PropType } from 'vue'
import { User, userLogout } from '~/libs/apiTypes'

export default defineNuxtComponent({
  name: 'User',

  props: {
    user: {
      type: Object as PropType<User | null>,
      default: null,
    },
  },

  computed: {
    loginUrl(): string {
      return useRuntimeConfig().public.API + '../../../users/auth/osm_oauth2'
    },
  },

  methods: {
    logout(): void {
      userLogout(useRuntimeConfig().public.API)
    },
  },
})
</script>
