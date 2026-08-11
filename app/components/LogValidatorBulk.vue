<script setup lang="ts">
defineProps<{ count: number }>()
defineEmits(['bulkValidation'])
</script>

<template>
  <div class="bulk-validator">
    <el-popconfirm
      :title="$t('logs.validate_selection_confirm', { n: count })"
      :confirm-button-text="$t('logs.validate_selection_confirm_ok')"
      :cancel-button-text="$t('logs.validate_selection_confirm_cancel')"
      confirm-button-type="success"
      width="220"
      @confirm="$emit('bulkValidation')"
    >
      <template #reference>
        <el-button type="success" style="width: 100%">
          ✓ {{ $t('logs.validate_selection') }}
        </el-button>
      </template>
    </el-popconfirm>
  </div>
</template>

<style scoped>
.bulk-validator {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
