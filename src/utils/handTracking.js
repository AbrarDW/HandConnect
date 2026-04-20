// Hand Tracking utility using MediaPipe
export async function setupHandTracking(video, canvas) {
  let isRunning = false
  let animationId = null
  let lastTime = 0

  // Load MediaPipe Hands
  const mpHands = await import('@mediapipe/hands')
  const mpDraw = await import('@mediapipe/drawing_utils')

  const hands = new mpHands.Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    }
  })

  const handDrawing = new mpDraw.DrawingUtils()

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  })

  function drawHand(results, canvas, ctx) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw neon effect background
    ctx.strokeStyle = 'rgba(131, 56, 236, 0.1)'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw neon connections
        ctx.strokeStyle = '#8338ec'
        ctx.lineWidth = 3
        ctx.shadowColor = '#8338ec'
        ctx.shadowBlur = 10
        
        // Draw hand connections
        handDrawing.drawConnectors(ctx, landmarks, mpHands.HAND_CONNECTIONS, {
          color: '#8338ec',
          lineWidth: 3
        })
        
        // Draw glowing landmarks
        ctx.fillStyle = '#ff006e'
        ctx.shadowColor = '#ff006e'
        ctx.shadowBlur = 15
        handDrawing.drawLandmarks(ctx, landmarks, {
          color: '#ff006e',
          lineWidth: 2
        })
        
        // Draw palm center
        const palmCenter = landmarks[9] // Middle finger base
        ctx.fillStyle = '#3a86ff'
        ctx.shadowColor = '#3a86ff'
        ctx.shadowBlur = 20
        ctx.beginPath()
        ctx.arc(
          palmCenter.x * canvas.width,
          palmCenter.y * canvas.height,
          8,
          0,
          2 * Math.PI
        )
        ctx.fill()
      }
    }
    
    // Reset shadow
    ctx.shadowBlur = 0
  }

  function processFrame(currentTime) {
    if (!isRunning) return
    
    const deltaTime = currentTime - lastTime
    if (deltaTime >= 16) { // ~60 FPS
      lastTime = currentTime
      animationId = requestAnimationFrame(processFrame)
    }
  }

  return {
    start: () => {
      isRunning = true
      lastTime = performance.now()
      animationId = requestAnimationFrame(processFrame)
      
      hands.onResults((results) => {
        if (canvas && canvas.getContext) {
          const ctx = canvas.getContext('2d')
          drawHand(results, canvas, ctx)
        }
      })
      
      hands.send({ image: video })
    },
    
    stop: () => {
      isRunning = false
      if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
    },
    
    reset: () => {
      if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }
}