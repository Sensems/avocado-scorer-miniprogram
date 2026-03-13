<template>
  <button
    class="haptic-btn"
    :class="[type, { disabled, loading }]"
    :style="customStyle"
    hover-class="haptic-btn-hover"
    :hover-stay-time="100"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
// Vue3 setup script automatically exposes props and emits macros

const props = defineProps({
  type: {
    type: String,
    default: 'default', // default, primary, danger
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  customStyle: {
    type: [Object, String],
    default: () => ({}),
  },
})

const emit = defineEmits(['click'])

function handleClick(e: Event) {
  if (props.disabled || props.loading)
    return

  // 触发轻微震动反馈
  uni.vibrateShort({
    type: 'light',
  })

  emit('click', e)
}
</script>

<style lang="scss" scoped>
.haptic-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 4px solid var(--color-border);
  background-color: #fdfbf7;
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 800; // Bold typography for neo-brutalism
  cursor: pointer;
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    background-color 150ms ease;
  padding: 12px 24px;
  margin: 0;
  box-sizing: border-box;
  box-shadow: 4px 4px 0px 0px var(--color-border);
  position: relative; // For better z-index management

  &::after {
    display: none; // Remove default uniapp button pseudo element
  }

  &.primary {
    background-color: var(--color-primary);
    color: #fdfbf7; // Light color for contrast with the avocado green
  }

  &.danger {
    background-color: var(--color-danger);
    color: #fdfbf7;
  }

  &.disabled {
    opacity: 0.6;
    background-color: #d9d2c5 !important;
    border-color: #8e8276 !important;
    box-shadow: none !important;
    color: #8e8276 !important;
    cursor: not-allowed;
    transform: none !important;
  }
}

.haptic-btn-hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px 0px var(--color-border) !important;
}
</style>
