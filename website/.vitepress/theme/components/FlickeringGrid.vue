<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const canvasRef = ref(null);
let animationFrameId;
let squares = [];
const gridSize = 40; // Larger grid for better visuals
const flickerChance = 0.03;
const decayRate = 0.02;
const color = "62, 175, 124"; // #3eaf7c

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const parent = canvas.parentElement;
  canvas.width = parent.clientWidth;
  canvas.height = parent.clientHeight;
  initSquares();
}

function initSquares() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const cols = Math.ceil(canvas.width / gridSize);
  const rows = Math.ceil(canvas.height / gridSize);
  squares = new Float32Array(cols * rows).fill(0);
}

function draw() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const cols = Math.ceil(width / gridSize);

  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < squares.length; i++) {
    // Ignite
    if (Math.random() < flickerChance) {
      squares[i] = Math.min(squares[i] + Math.random() * 0.8, 1);
    }

    // Decay
    squares[i] = Math.max(squares[i] - decayRate, 0);

    if (squares[i] > 0) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * gridSize;
      const y = row * gridSize;

      ctx.fillStyle = `rgba(${color}, ${squares[i] * 0.3})`;
      // Draw rounded rect or simple rect
      ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
    }
  }

  animationFrameId = requestAnimationFrame(draw);
}

onMounted(() => {
  window.addEventListener("resize", resizeCanvas);
  // Delay slightly to ensure container is sized
  setTimeout(() => {
    resizeCanvas();
    draw();
  }, 100);
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeCanvas);
  cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <div class="flickering-grid-wrapper">
    <canvas ref="canvasRef" class="flickering-canvas"></canvas>
    <div class="logo-container">
      <img src="/logo.png" alt="Lapeh Logo" class="hero-logo" />
    </div>
  </div>
</template>

<style scoped>
.flickering-grid-wrapper {
  position: relative;
  width: 320px;
  height: 320px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(
    circle at center,
    rgba(62, 175, 124, 0.15) 0%,
    transparent 70%
  );
  border-radius: 50%;
}

.flickering-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  mask-image: radial-gradient(black 40%, transparent 70%);
  -webkit-mask-image: radial-gradient(black 40%, transparent 70%);
  z-index: 1;
}

.logo-container {
  z-index: 2;
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 6s ease-in-out infinite;
}

.hero-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 30px rgba(62, 175, 124, 0.4));
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

@media (max-width: 640px) {
  .flickering-grid-wrapper {
    width: 260px;
    height: 260px;
  }
  .logo-container {
    width: 140px;
    height: 140px;
  }
}
</style>
