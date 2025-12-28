import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import FlickeringGrid from './components/FlickeringGrid.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(FlickeringGrid)
    })
  }
}
