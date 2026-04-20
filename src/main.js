import { createApp } from 'vue';
import App from './App.vue';
import './assets/styles.css';

function initApp() {
  const app = createApp(App);
  app.mount('#app');
}

if (window.hands && window.drawingUtils) {
  initApp();
} else {
  const checkInterval = setInterval(() => {
    if (window.hands && window.drawingUtils) {
      clearInterval(checkInterval);
      initApp();
    }
  }, 100);
}