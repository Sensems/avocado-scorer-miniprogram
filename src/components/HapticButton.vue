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
import { defineEmits, defineProps } from 'vue'

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
  border: none;
  border-radius: 12px;
  background-color: #2a2a2a;
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.1s ease;
  padding: 12px 24px;
  margin: 0;
  box-sizing: border-box;

  &::after {
    border: none;
  }

  &.primary {
    background-color: var(--color-primary);
    color: #1e1e1e;
    box-shadow: 0 4px 16px rgba(138, 154, 91, 0.3);
  }

  &.danger {
    background-color: var(--color-danger);
    color: #fff;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.haptic-btn-hover {
  transform: scale(0.96);
  opacity: 0.8 !important;
}
</style>
