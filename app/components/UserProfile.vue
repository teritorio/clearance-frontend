<script setup lang="ts">
const form = useTemplateRef<HTMLFormElement>('form')

const { public: { api } } = useRuntimeConfig()

const loginUrl = computed(() => `${api}../../../users/auth/osm_oauth2`)

const { user, logout } = useAuth()

const initial = computed(() => user.value?.osm_name?.charAt(0).toUpperCase() ?? '')

function submit(): void {
  form.value?.submit()
}

function handleCommand() {
  logout()
}
</script>

<template>
  <form v-if="!user" ref="form" :action="loginUrl" method="post">
    <el-button type="primary" @click="submit">
      {{ $t('user.login') }}
    </el-button>
  </form>
  <el-dropdown v-else trigger="click" @command="handleCommand">
    <el-avatar :src="user.osm_image_url" class="user-avatar">
      {{ initial }}
    </el-avatar>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item disabled class="user-name">
          {{ user.osm_name }}
        </el-dropdown-item>
        <el-dropdown-item divided command="logout" class="logout-item">
          {{ $t('user.logout') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped>
.user-avatar {
  cursor: pointer;
  background-color: var(--el-color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  user-select: none;
}

.user-avatar:hover {
  opacity: 0.85;
}

.user-name {
  font-weight: 600;
  color: var(--el-text-color-primary) !important;
  cursor: default;
}

:deep(.logout-item) {
  color: var(--el-color-danger) !important;
}

:deep(.logout-item:hover) {
  background-color: var(--el-color-danger-light-9) !important;
  color: var(--el-color-danger) !important;
}
</style>
