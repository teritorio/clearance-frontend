<script setup lang="ts">
import LogsComponent from '~/components/LogsComponent.vue'
import type { Log, User } from '~/libs/types'

const props = defineProps<{
  logs: Log[]
  projectSlug: string
}>()

defineEmits(['validate'])

const user = useState<User>('user')

const isProjectUser = computed(() => {
  return !!user.value.projects?.includes(props.projectSlug)
})

const scrollCount = ref(10)
function scrollLoad() {
  scrollCount.value += 10
}
</script>

<template>
  <div>
    <h3>{{ $t('logs.data') }}</h3>
    <p>{{ $t('logs.data_details') }}</p>
    <ul>
      <li>{{ $t('logs.data_details_osm') }}</li>
      <li>{{ $t('logs.data_details_manual') }}</li>
    </ul>

    <el-space v-infinite-scroll="scrollLoad" :fill="true" wrap :size="20">
      <LogsComponent
        v-for="log in (logs || []).slice(0, scrollCount + 1)"
        :key="log.id"
        :log="log"
        :project="projectSlug"
        :project-user="isProjectUser"
        @accept="$emit('validate', $event)"
      />
    </el-space>

    <iframe name="hidden_josm_target" style="display: none" />
  </div>
</template>

<style scoped>
.item {
  margin-top: 0.7em;
  margin-right: 1.3em;
}
</style>
