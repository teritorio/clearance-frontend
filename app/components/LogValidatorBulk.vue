<script setup lang="ts">
defineEmits(['bulkValidation'])
</script>

<template>
  <el-button-group>
    <el-button type="primary" @click="$emit('bulkValidation')">
      ✓ {{ $t('logs.validate_selection') }}
    </el-button>
  </el-button-group>
</template>
