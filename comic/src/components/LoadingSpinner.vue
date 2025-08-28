<template>
  <div class="flex flex-col justify-center items-center gap-4">
    <!-- Logo and text combination -->
    <div class="loading-wrapper">
      <!-- Animated logo container -->
      <div class="logo-container">
        <img 
          src="/logo.png" 
          alt="Loading..." 
          class="logo-main"
        />
        <!-- Eye blink overlay -->
        <div class="eye-blink-overlay"></div>
        <!-- Heart particles -->
        <div class="heart-container">
          <span class="heart heart-1">♥</span>
          <span class="heart heart-2">♥</span>
          <span class="heart heart-3">♥</span>
        </div>
      </div>
      
      <!-- Brand text with animation -->
      <div class="brand-text-container">
        <span class="brand-text">禁漫社</span>
        <span class="brand-heart">♥</span>
      </div>
      
      <!-- Loading dots -->
      <div class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
// Loading spinner matching site aesthetic
</script>

<style scoped>
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Logo container with animations */
.logo-container {
  position: relative;
  width: 64px;
  height: 64px;
  animation: breathe 3s ease-in-out infinite;
}

.logo-main {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(236, 72, 153, 0.3);
  box-shadow: 0 0 20px rgba(236, 72, 153, 0.4);
}

/* Eye blink effect */
.eye-blink-overlay {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #1f2937, transparent);
  opacity: 0;
  animation: blink 4s infinite;
}

/* Floating hearts */
.heart-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  pointer-events: none;
}

.heart {
  position: absolute;
  color: #ec4899;
  font-size: 12px;
  opacity: 0;
  animation: float-heart 3s ease-out infinite;
}

.heart-1 {
  top: 50%;
  left: 50%;
  animation-delay: 0s;
}

.heart-2 {
  top: 50%;
  left: 50%;
  animation-delay: 1s;
}

.heart-3 {
  top: 50%;
  left: 50%;
  animation-delay: 2s;
}

/* Brand text styling matching SiteLogo */
.brand-text-container {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.brand-text {
  font-family: 'Pacifico', 'Dancing Script', 'Satisfy', 'Kaushan Script', 'Permanent Marker', fantasy;
  font-size: 1.5rem;
  font-weight: 900;
  color: #ec4899;
  text-shadow: 
    2px 2px 0 rgba(31, 41, 55, 0.8),
    3px 3px 0 rgba(219, 39, 119, 0.5);
  letter-spacing: 0.05em;
  animation: glow-text 2s ease-in-out infinite;
}

.brand-heart {
  color: #f9a8d4;
  font-size: 0.875rem;
  animation: pulse-heart 1.5s ease-in-out infinite;
}

/* Loading dots */
.loading-dots {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #ec4899, #db2777);
  border-radius: 50%;
  animation: bounce-dot 1.4s ease-in-out infinite;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0;
}

/* Animations */
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes rotate-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes blink {
  0%, 40%, 60%, 100% {
    opacity: 0;
    height: 3px;
  }
  50% {
    opacity: 0.8;
    height: 8px;
  }
}

@keyframes float-heart {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 1;
  }
  50% {
    opacity: 1;
    transform: translate(random(-30, 30) * 1px, -30px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(random(-50, 50) * 1px, -60px) scale(0.5);
  }
}

@keyframes glow-text {
  0%, 100% {
    filter: brightness(1) drop-shadow(0 0 5px rgba(236, 72, 153, 0.5));
  }
  50% {
    filter: brightness(1.1) drop-shadow(0 0 15px rgba(236, 72, 153, 0.8));
  }
}

@keyframes pulse-heart {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes bounce-dot {
  0%, 80%, 100% {
    transform: scale(0) translateY(0);
  }
  40% {
    transform: scale(1) translateY(-10px);
  }
}

/* Replace random values with alternating positions */
.heart-1 {
  animation: float-heart-1 3s ease-out infinite;
}

.heart-2 {
  animation: float-heart-2 3s ease-out infinite;
  animation-delay: 1s;
}

.heart-3 {
  animation: float-heart-3 3s ease-out infinite;
  animation-delay: 2s;
}

@keyframes float-heart-1 {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 1;
  }
  50% {
    opacity: 1;
    transform: translate(-25px, -30px) scale(1) rotate(-15deg);
  }
  100% {
    opacity: 0;
    transform: translate(-40px, -60px) scale(0.5) rotate(-30deg);
  }
}

@keyframes float-heart-2 {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 1;
  }
  50% {
    opacity: 1;
    transform: translate(20px, -35px) scale(1) rotate(20deg);
  }
  100% {
    opacity: 0;
    transform: translate(35px, -65px) scale(0.5) rotate(40deg);
  }
}

@keyframes float-heart-3 {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 1;
  }
  50% {
    opacity: 1;
    transform: translate(0, -40px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(0, -70px) scale(0.4);
  }
}
</style>