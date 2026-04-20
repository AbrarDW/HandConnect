import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles.css'

function mountApp() {
  const app = createApp(App)
  app.mount('#app')
}

// Wait for MediaPipe to load via CDN
if (window.hands && window.drawingUtils) {
  mountApp()
} else {
  const checkInterval = setInterval(() => {
    if (window.hands && window.drawingUtils) {
      clearInterval(checkInterval)
      mountApp()
    }
  }, 100)
}