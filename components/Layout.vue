<template>
  <el-page-header>
    <template #content>
      <div class="flex items-right">
        <User :user="user" />
      </div>
    </template>
  </el-page-header>
  <div>
    <slot />
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue'
import { User } from '~/libs/apiTypes'

export default defineNuxtComponent({
  name: 'Layout',

  props: {
    user: {
      type: Object as PropType<User | null>,
      default: null,
    },
  },
})
</script>
