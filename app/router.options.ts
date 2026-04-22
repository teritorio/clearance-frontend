import type { RouterScrollBehavior } from 'vue-router'

const scrollBehavior: RouterScrollBehavior = (_to, _from, savedPosition) => {
  if (savedPosition) {
    return savedPosition
  }
  return { top: 0 }
}

export default { scrollBehavior }
