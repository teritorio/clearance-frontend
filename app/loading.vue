<template>
  <el-main class="loading-page">
    <div class="loading-content">
      <div class="loading-spinner">
        <svg class="circular" viewBox="-10 -10 50 50">
          <path class="path" d="M 30 15 L 28 17 A 15 15 0 0 1 15 30 A 15 15 0 0 1 2 17 A 15 15 0 0 1 15 4.000 A 15 15 0 0 1 28 17 L 30 15 Z" />
        </svg>
      </div>
      <p class="loading-text">
        {{ $t('common.loading') }}
      </p>
    </div>
  </el-main>
</template>

<style scoped>
.loading-page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.loading-spinner {
  width: 42px;
  height: 42px;
}

.circular {
  width: 42px;
  height: 42px;
  animation: loading-rotate 2s linear infinite;
}

.path {
  fill: none;
  stroke: var(--el-color-primary);
  stroke-width: 2;
  stroke-linecap: round;
  animation: loading-dash 1.5s ease-in-out infinite;
}

.loading-text {
  margin: 0;
  font-size: 14px;
  color: var(--el-color-primary);
}

@keyframes loading-rotate {
  100% { transform: rotate(360deg); }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}
</style>
