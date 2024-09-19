import Logs from '@/components/Logs.vue'
import { describe, expect, it, mount } from '@vue/test-utils'

describe('logs', () => {
  it('is a Vue instance', () => {
    const wrapper = mount(Logs)
    expect(wrapper.vm).toBeTruthy()
  })
})
