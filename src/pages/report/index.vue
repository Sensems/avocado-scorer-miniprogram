<template>
  <view class="report-container px-4 py-8">
    <view class="title-bar mb-8 text-center">
      <view class="shadow-text mb-2 text-3xl text-[#8A9A5B] font-bold">
        战局清算
      </view>
      <view class="text-sm text-gray-500">
        本局产生的梗图称号已自动生成
      </view>
    </view>

    <view id="poster-area" class="report-poster">
      <view
        v-for="(res, index) in titleResults"
        :key="res.playerId"
        class="player-rank-item mb-4 flex items-center justify-between rounded-xl p-4"
        :class="getRankClass(res.level)"
      >
        <view class="info flex flex-col">
          <view class="mb-1 text-lg text-white font-bold">
            <text v-if="index === 0">👑</text>
            <text v-if="index === titleResults.length - 1">💩</text>
            {{ res.name }}
          </view>
          <view class="text-xs tracking-wider" :class="getWordClass(res.level)">
            {{ res.wordInfo }}
          </view>
        </view>
        <view class="score text-2xl font-bold font-mono" :class="res.score > 0 ? 'text-[#8A9A5B]' : 'text-[#ea5455]'">
          {{ res.score > 0 ? '+' : '' }}{{ res.score }}
        </view>
      </view>
    </view>

    <view class="actions mt-10 w-full flex flex-col gap-4">
      <HapticButton type="primary" class="shadow-btn w-full text-lg" open-type="share">
        转发到群里嘲讽
      </HapticButton>
      <HapticButton type="default" class="w-full border-1 border-gray-600 bg-transparent text-lg" @click="goHome">
        返回大厅
      </HapticButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { TitleResult } from '@/utils/titleEngine'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import HapticButton from '@/components/HapticButton.vue'
import { useScoringStore } from '@/store/useScoringStore'
import { generateTitles } from '@/utils/titleEngine'

defineOptions({ name: 'Report' })
definePage({
  style: {
    navigationBarTitleText: '战事播报',
    navigationBarBackgroundColor: '#1E1E1E',
  },
})

const store = useScoringStore()
const titleResults = ref<TitleResult[]>([])

onMounted(() => {
  titleResults.value = generateTitles(store.players, store.historyStack)
})

function getRankClass(level: number) {
  if (level === 1)
    return 'bg-yellow-900/30 border-2 border-yellow-500 scale-105 my-6'
  if (level === 2)
    return 'bg-red-900/30 border border-gray-600 opacity-80'
  return 'bg-[#2A2A2A] border border-transparent'
}

function getWordClass(level: number) {
  if (level === 1)
    return 'text-yellow-400 font-bold'
  if (level === 2)
    return 'text-gray-400 line-through'
  return 'text-gray-400'
}

function goHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

onShareAppMessage(() => {
  // 原生朋友圈或卡片分享。我们把第一名的霸气称号带在title上。
  const c位 = titleResults.value[0]
  return {
    title: `🏆 战报: [${c位.name}] 刚刚获得了称号「${c位.wordInfo}」！`,
    path: `/pages/index/index?roomId=`, // redirect back to a new game
  }
})
</script>

<style lang="scss" scoped>
.report-container {
  min-height: 100vh;
  background-color: var(--bg-dark);
}
.shadow-text {
  text-shadow: 0 4px 12px rgba(138, 154, 91, 0.4);
}
.shadow-btn {
  box-shadow: 0 8px 24px rgba(138, 154, 91, 0.3);
}
.player-rank-item {
  transition: all 0.3s ease;
}
</style>
