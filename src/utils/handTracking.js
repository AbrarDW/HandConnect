// Hand Tracking utility using MediaPipe loaded from CDN
export async function setupHandTracking(video, canvas) {
  let isRunning = false
  let animationId = null
  let lastTime = 0

  // The CDN scripts expose these globals:
  //   window.hands      -> MediaPipe Hands solution
  //   window.drawingUtils -> drawing utilities
  //   window.hands.HAND_CONNECTIONS -> constant array

  const hands = new window.hands.Hands({
    locateFile: () => 'https://unpkg.com/@mediapipe/hands@0.4.1675469240/',
  })

  const drawing = new window.drawingUtils.DrawingUtils(canvas.getContext('2d'))

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  })

  function drawHand(results, ctx) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // faint background grid (optional)
    ctx.strokeStyle = 'rgba(131, 56, 236, 0.1)'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // connections
        drawing.drawConnectors(ctx, landmarks, window.hands.HAND_CONNECTIONS, {
          color: '#8338ec',
          lineWidth: 3,
        })
        // landmarks
        drawing.drawLandmarks(ctx, landmarks, {
          color: '#ff006e',
          lineWidth: 2,
        })

        // palm centre glow
        const palm = landmarks[9] // middle finger base
        ctx.fillStyle = '#3a86ff'
        ctx.shadowColor = '#3a86ff'
        ctx.shadowBlur = 20
        ctx.beginPath()
        ctx.arc(palm.x * canvas.width, palm.y * canvas.height, 8, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.shadowBlur = 0
  }

  function processFrame(now) {
    if (!isRunning) return
    const delta = now - lastTime
    if (delta >= 16) { // ~60 FPS
      lastTime = now
      animationId = requestAnimationFrame(() => processFrame(now))
    }
    // Send current video frame to MediaPipe
    hands.send({ image: video })
  }

  return {
    start() {
      isRunning = true
      lastTime = performance.now()
      animationId = requestAnimationFrame(t => processFrame(t))

      hands.onResults((results) => {
        if (canvas && canvas.getContext) {
          const ctx = canvas.getContext('2d')
          drawHand(results, ctx)
        }
      })
    },

    stop() {
      isRunning = false
      if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
    },

    reset() {
      if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    },
  }
}