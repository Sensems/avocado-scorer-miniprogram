<template>
  <div class="number-scroller" :style="{ height: `${height}px` }">
    <div
      class="scroll-track"
      :class="[isAnimating ? 'animating' : '', `dir-${scrollDir}`]"
      :style="{ transform: `translateY(${translateY}px)` }"
      @transitionend="onTransitionEnd"
    >
      <div class="val-item" :style="{ height: `${height}px`, lineHeight: `${height}px` }">
        {{ scrollDir === 'up' ? displayOld : displayNew }}
      </div>
      <div class="val-item" :style="{ height: `${height}px`, lineHeight: `${height}px` }">
        {{ scrollDir === 'up' ? displayNew : displayOld }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  value: number | string
  height?: number
}>(), {
  height: 24,
})

const displayOld = ref(props.value)
const displayNew = ref(props.value)
const isAnimating = ref(false)
const scrollDir = ref<'up' | 'down'>('up')
const translateY = ref(0)

watch(() => props.value, async (newV, oldV) => {
  if (newV === oldV)
    return

  // 1. 设置数值与方向
  const n = Number(newV)
  const o = Number(oldV)
  scrollDir.value = n >= o ? 'up' : 'down'
  displayOld.value = oldV
  displayNew.value = newV

  // 2. 移除 transition, 瞬间归位
  isAnimating.value = false
  if (scrollDir.value === 'up') {
    translateY.value = 0
  }
  else {
    translateY.value = -props.height
  }

  await nextTick()

  // 3. 强制重绘并加回 transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isAnimating.value = true
      if (scrollDir.value === 'up') {
        translateY.value = -props.height
      }
      else {
        translateY.value = 0
      }
    })
  })
})

function onTransitionEnd() {
  isAnimating.value = false
  displayOld.value = displayNew.value
  translateY.value = 0
  scrollDir.value = 'up' // reset
}
</script>

<style lang="scss" scoped>
.number-scroller {
  display: inline-block;
  overflow: hidden;
  vertical-align: middle;
}

.scroll-track {
  display: flex;
  flex-direction: column;
}

.animating {
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.val-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-variant-numeric: tabular-nums; /* 等宽数字 */
}
</style>
