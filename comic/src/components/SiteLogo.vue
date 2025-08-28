<template>
  <div class="flex items-center space-x-2">
    <img 
      src="/logo.png" 
      alt="禁漫社" 
      :class="[
        'object-contain',
        size === 'small' ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'
      ]"
    />
    <div class="flex items-baseline">
      <span 
        :class="[
          'text-pink-500 font-extrabold tracking-wider',
          size === 'small' ? 'text-lg' : 'text-xl sm:text-2xl'
        ]"
        style="font-family: 'Pacifico', 'Dancing Script', 'Satisfy', 'Kaushan Script', 'Permanent Marker', fantasy; text-shadow: 2px 2px 0 rgba(31, 41, 55, 0.8), 3px 3px 0 rgba(219, 39, 119, 0.5); letter-spacing: 0.05em;"
      >
        禁漫社
      </span>
      <span 
        :class="[
          'text-pink-400 ml-1',
          size === 'small' ? 'text-xs' : 'text-sm'
        ]"
      >♥</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['small', 'normal'].includes(value)
  }
})
</script>