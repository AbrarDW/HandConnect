<template>
  <div class="app">
    <div class="container">
      <div class="header">
        <h1 class="title">NEON AURA AR</h1>
        <p class="subtitle">Advanced Hand Tracking Experience</p>
      </div>
      
      <div class="content">
        <div class="camera-section" v-if="!isInitialized">
          <div class="camera-overlay">
            <div class="camera-icon">📷</div>
            <p class="camera-text">Grant camera permissions to begin</p>
          </div>
          <button @click="requestCameraPermission" class="start-button">
            Start AR Experience
          </button>
        </div>

        <div class="ar-section" v-else>
          <div class="video-container">
            <video ref="video" autoplay muted playsinline class="video"></video>
            <canvas ref="canvas" class="canvas"></canvas>
            <div class="hand-indicator" v-if="handDetected">
              <div class="neon-pulse">✋</div>
              <p class="tracking-text">Hand Detected</p>
            </div>
          </div>
          
          <div class="controls">
            <button @click="toggleAR" class="control-button">
              {{ isRunning ? 'Pause' : 'Resume' }}
            </button>
            <button @click="resetAR" class="control-button">
              Reset
            </button>
          </div>
        </div>

        <div class="info-section">
          <div class="feature-card">
            <h3>🎯 Real-time Tracking</h3>
            <p>Advanced hand detection using MediaPipe</p>
          </div>
          <div class="feature-card">
            <h3>🌈 Neon Effects</h3>
            <p>Beautiful glowing visualizations</p>
          </div>
          <div class="feature-card">
            <h3>📱 Responsive</h3>
            <p>Works on all devices</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { setupHandTracking } from './utils/handTracking'

export default {
  name: 'App',
  setup() {
    const video = ref(null)
    const canvas = ref(null)
    const isInitialized = ref(false)
    const isRunning = ref(false)
    const handDetected = ref(false)
    const handTracker = ref(null)

    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        })
        
        if (video.value) {
          video.value.srcObject = stream
        }
        
        isInitialized.value = true
        
        // Initialize hand tracking
        handTracker.value = await setupHandTracking(video.value, canvas.value)
        
        // Start tracking
        handTracker.value.start()
        isRunning.value = true
        
      } catch (error) {
        console.error('Error accessing camera:', error)
        alert('Unable to access camera. Please check permissions.')
      }
    }

    const toggleAR = () => {
      if (isRunning.value && handTracker.value) {
        handTracker.value.stop()
      } else if (handTracker.value) {
        handTracker.value.start()
      }
      isRunning.value = !isRunning.value
    }

    const resetAR = () => {
      if (handTracker.value) {
        handTracker.value.stop()
        handTracker.value.reset()
      }
      isRunning.value = false
      handDetected.value = false
    }

    onUnmounted(() => {
      if (handTracker.value) {
        handTracker.value.stop()
      }
    })

    return {
      video,
      canvas,
      isInitialized,
      isRunning,
      handDetected,
      requestCameraPermission,
      toggleAR,
      resetAR
    }
  }
}
</script>