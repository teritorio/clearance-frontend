import { mount } from '@vue/test-utils'
import Logs from '@/components/Logs.vue'

describe('logs', () => {
  it('is a Vue instance', () => {
    const wrapper = mount(Logs)
    expect(wrapper.vm).toBeTruthy()
  })
})
