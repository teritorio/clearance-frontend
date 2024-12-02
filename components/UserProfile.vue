<script lang="ts">
import type { PropType } from 'vue'
import type { User } from '~/libs/types'
import { userLogout } from '~/libs/apiTypes'

export default defineNuxtComponent({
  name: 'User',

  props: {
    user: {
      type: Object as PropType<User | null>,
      default: null,
    },
  },

  setup() {
    const form = shallowRef<HTMLFormElement>()

    return { form }
  },

  computed: {
    loginUrl(): string {
      return `${this.$config.public.api}../../../users/auth/osm_oauth2`
    },
  },

  methods: {
    submit(): void {
      this.form?.submit()
    },
    logout(): void {
      userLogout(this.$config.public.api)
    },
  },
})
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
