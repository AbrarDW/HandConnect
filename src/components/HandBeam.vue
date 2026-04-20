<template>
  <div class="hand-beam">
    <video ref="video" autoplay muted playsinline class="video" />
    <canvas ref="canvas" class="overlay" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

const video = ref(null)
const canvas = ref(null)

let handLandmarker = null
let animationId = null
let particles = []

const THRESHOLD = 0.1 // normalized distance between fingertips
const GLOW_COLOR = 'rgba(0,255,255,0.9)'
const MODEL_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12'
const MODEL_URL = `${MODEL_BASE}/hand_landmarker.task`

async function initLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(`${MODEL_BASE}/wasm`)
  handLandmarker = await HandLandmarker.create(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
    runningMode: 'VIDEO',
    numHands: 2,
  })
}

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  })
  video.value.srcObject = stream
  await new Promise((resolve) => {
    video.value.onloadedmetadata = () => {
      video.value.play()
      resolve()
    }
  })
}

function spawnParticle(x, y) {
  const angle = Math.random() * Math.PI * 2
  const speed = Math.random() * 2 + 0.5
  particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, size: Math.random() * 2 + 1 })
}

function drawBeam(ctx, p1, p2, time) {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const len = Math.hypot(dx, dy)
  const angle = Math.atan2(dy, dx)
  const base = 4
  const amp = 2
  const thickness = base + amp * Math.abs(Math.sin(time * 0.006))

  ctx.save()
  ctx.translate(p1.x, p1.y)
  ctx.rotate(angle)
  ctx.shadowBlur = 20
  ctx.shadowColor = GLOW_COLOR
  ctx.strokeStyle = GLOW_COLOR
  ctx.lineWidth = thickness
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(len, 0)
  ctx.stroke()

  const sparks = Math.floor(Math.random() * 3)
  for (let i = 0; i < sparks; i++) {
    const t = Math.random()
    spawnParticle(p1.x + dx * t, p1.y + dy * t)
  }
  ctx.restore()
}

function render() {
  const ctx = canvas.value.getContext('2d')
  const vw = (canvas.value.width = video.value.videoWidth)
  const vh = (canvas.value.height = video.value.videoHeight)
  ctx.clearRect(0, 0, vw, vh)

  if (handLandmarker) {
    const now = performance.now()
    const result = handLandmarker.detectForVideo(video.value, now)
    const lm = result.landmarks
    if (lm && lm.length >= 2) {
      const tipA = lm[0][8]
      const tipB = lm[1][8]
      const x1 = tipA.x * vw
      const y1 = tipA.y * vh
      const x2 = tipB.x * vw
      const y2 = tipB.y * vh
      const dist = Math.hypot(x2 - x1, y2 - y1) / Math.max(vw, vh)
      if (dist < THRESHOLD) {
        drawBeam(ctx, { x: x1, y: y1 }, { x: x2, y: y2 }, now)
      }
    }
  }

  particles = particles.filter(p => p.life > 0)
  particles.forEach(p => {
    p.x += p.vx
    p.y += p.vy
    p.life -= 0.02
    ctx.globalAlpha = Math.max(p.life, 0)
    ctx.fillStyle = GLOW_COLOR
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1
  animationId = requestAnimationFrame(render)
}

onMounted(async () => {
  await Promise.all([initLandmarker(), startCamera()])
  render()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  if (handLandmarker) handLandmarker.close()
  if (video.value?.srcObject) video.value.srcObject.getTracks().forEach(t => t.stop())
})
</script>

<style scoped>
.hand-beam {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: auto;
}
.video,
.overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
