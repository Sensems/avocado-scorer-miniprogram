<template>
  <view class="scoring-board">
    <!-- 2x2 胖卡片阵列 -->
    <view class="players-grid">
      <view
        v-for="player in store.players"
        :key="player.id"
        class="player-card"
        :class="{
          'active': store.activeTargetId === player.id,
          'is-me': player.id === store.localOperatorId,
        }"
        @click="selectPlayer(player.id)"
      >
        <view class="card-inner">
          <view class="p-header">
            <view class="avatar-sm">
              {{ player.name.slice(0, 1) }}
            </view>
            <view class="name">
              {{ player.isVirtual ? '[替]' : '' }}{{ player.name }}
            </view>
          </view>
          <view class="score-display" :class="{ positive: player.score > 0, negative: player.score < 0 }">
            <text v-if="player.score > 0" class="sign">+</text>
            <NumberScroller :value="player.score" :height="36" class="scroller" />
          </view>
        </view>
      </view>
    </view>

    <!-- 操作流水区 -->
    <view class="action-bar">
      <view v-if="store.lastScoreLog" class="log-bubble">
        <text class="log-text">刚结: {{ store.lastScoreLog.toName }} 收 {{ store.lastScoreLog.fromName }} {{ store.lastScoreLog.amount }}</text>
      </view>
      <view v-else class="log-bubble empty">
        <text class="log-text">暂无记分记录</text>
      </view>
      <HapticButton type="danger" custom-style="padding: 6px 12px; font-size: 14px; border-radius: 20px;" :disabled="!store.lastScoreLog" @click="undo">
        ⌫ 撤销
      </HapticButton>
    </view>

    <!-- 收银台输入区 -->
    <view class="console-area">
      <view class="input-preview">
        <view class="target-hint">
          <template v-if="!store.activeTargetId">
            <text class="text-gray-500">点选上方玩家卡片</text>
          </template>
          <template v-else>
            对 <text class="highlight">[{{ currentTargetName }}]</text> 收付
          </template>
        </view>
        <view class="amount-val">
          {{ currentInput || '...' }}
        </view>
      </view>

      <!-- 快捷筹码 -->
      <view class="chips-row">
        <HapticButton class="chip-btn" custom-style="flex:1; margin-right:8px" @click="addInput('10')">
          +10
        </HapticButton>
        <HapticButton class="chip-btn" custom-style="flex:1; margin-right:8px" @click="addInput('50')">
          +50
        </HapticButton>
        <HapticButton class="chip-btn" custom-style="flex:1" @click="addInput('100')">
          +100
        </HapticButton>
      </view>

      <!-- 4x4 Numpad -->
      <view class="numpad-grid">
        <HapticButton class="num-btn" @click="appendNum('1')">
          1
        </HapticButton>
        <HapticButton class="num-btn" @click="appendNum('2')">
          2
        </HapticButton>
        <HapticButton class="num-btn" @click="appendNum('3')">
          3
        </HapticButton>
        <HapticButton class="act-btn btn-win" @click="confirmScore(true)">
          我收 TA
        </HapticButton>

        <HapticButton class="num-btn" @click="appendNum('4')">
          4
        </HapticButton>
        <HapticButton class="num-btn" @click="appendNum('5')">
          5
        </HapticButton>
        <HapticButton class="num-btn" @click="appendNum('6')">
          6
        </HapticButton>
        <HapticButton class="act-btn btn-lose" @click="confirmScore(false)">
          我付 TA
        </HapticButton>

        <HapticButton class="num-btn" @click="appendNum('7')">
          7
        </HapticButton>
        <HapticButton class="num-btn" @click="appendNum('8')">
          8
        </HapticButton>
        <HapticButton class="num-btn" @click="appendNum('9')">
          9
        </HapticButton>
        <HapticButton class="act-btn btn-allin" @click="confirmAllIn">
          🌊 全收
        </HapticButton>

        <HapticButton class="num-btn btn-c" @click="clearInput">
          C
        </HapticButton>
        <HapticButton class="num-btn" @click="appendNum('0')">
          0
        </HapticButton>
        <HapticButton class="num-btn" @click="backspaceInput">
          ⌫
        </HapticButton>
        <HapticButton class="act-btn btn-end" @click="endGame">
          结束对局
        </HapticButton>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import HapticButton from '@/components/HapticButton.vue'
import NumberScroller from '@/components/NumberScroller.vue'
import { useScoringStore } from '@/store/useScoringStore'

defineOptions({ name: 'ScoringBoard' })
definePage({
  style: {
    navigationBarTitleText: '核心收银台',
    navigationBarBackgroundColor: '#1E1E1E',
    navigationBarTextStyle: 'white',
    backgroundColor: '#1E1E1E',
    enablePullDownRefresh: false,
    disableScroll: true,
  },
})

const store = useScoringStore()
const currentInput = ref('')

const currentTargetName = computed(() => {
  const target = store.players.find((p: any) => p.id === store.activeTargetId)
  return target ? target.name : ''
})

function selectPlayer(id: string) {
  // 自己不作为独立被选择锚点，但为了一收多或UI演示可以点自身
  if (id === store.localOperatorId) {
    store.setActiveTarget(id)
    return
  }
  store.setActiveTarget(id)
}

function appendNum(n: string) {
  if (currentInput.value.length > 5)
    return // 防止数字过大溢出
  if (currentInput.value === '0')
    currentInput.value = n
  else currentInput.value += n
}
function addInput(n: string) {
  if (currentInput.value.length > 5)
    return
  currentInput.value = (Number(currentInput.value || 0) + Number(n)).toString()
}
function clearInput() {
  currentInput.value = ''
}
function backspaceInput() {
  currentInput.value = currentInput.value.slice(0, -1)
}

function confirmScore(iAmReceiver: boolean) {
  const val = Number(currentInput.value)
  if (!val || val <= 0) {
    uni.showToast({ title: '请输入金额', icon: 'none' })
    return
  }
  if (!store.activeTargetId) {
    uni.showToast({ title: '请先选定目标玩家', icon: 'none' })
    return
  }
  if (store.activeTargetId === store.localOperatorId) {
    uni.showToast({ title: '不能给自己收付款', icon: 'none' })
    return
  }

  if (iAmReceiver) {
    // 我收 TA
    store.addScore(store.activeTargetId, store.localOperatorId, val)
  }
  else {
    // 我付 TA
    store.addScore(store.localOperatorId, store.activeTargetId, val)
  }

  currentInput.value = ''
  // 保持焦点，方便连刷
}

function confirmAllIn() {
  const baseAmount = Number(currentInput.value)
  if (!baseAmount || baseAmount <= 0) {
    uni.showToast({ title: '请输入底分金额', icon: 'none' })
    return
  }

  // 默认由“我”或选定的人全收
  const winnerId = store.activeTargetId || store.localOperatorId
  store.allIn(winnerId, baseAmount)

  currentInput.value = ''
}

function undo() {
  store.undoLastScore()
}

function endGame() {
  if (store.historyStack.length === 0) {
    uni.showToast({ title: '没有记分，直接退出', icon: 'none' })
    setTimeout(() => { uni.reLaunch({ url: '/pages/index/index' }) }, 1500)
    return
  }
  // 跳转战报海报页
  uni.navigateTo({ url: '/pages/report/index' })
}
</script>

<style lang="scss" scoped>
.scoring-board {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0f1115;
  background-image:
    radial-gradient(circle at 80% 0%, rgba(138, 154, 91, 0.05), transparent 40%),
    radial-gradient(circle at 20% 100%, rgba(124, 58, 237, 0.03), transparent 30%);
  color: #fff;
  overflow: hidden;
}

.players-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  padding: 16px 20px;
  flex: 1; /* 撑满上半部 */
  max-height: 48vh;
}

.player-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);

  &.active {
    background: rgba(138, 154, 91, 0.05);
    border-color: rgba(138, 154, 91, 0.6);
    box-shadow:
      0 0 24px rgba(138, 154, 91, 0.15),
      inset 0 0 12px rgba(138, 154, 91, 0.1);
    transform: translateY(-2px) scale(1.02);
  }

  &.is-me {
    &::after {
      content: '我';
      position: absolute;
      top: 0;
      right: 0;
      background: linear-gradient(135deg, #b5c58a, #8a9a5b);
      color: #0f1115;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 0 24px 0 16px;
      box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.2);
    }
  }
}

.card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.p-header {
  display: flex;
  align-items: center;
  gap: 10px;

  .avatar-sm {
    width: 32px;
    height: 32px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: #e2e8f0;
  }
  .name {
    font-size: 15px;
    font-weight: 600;
    color: #cbd5e1;
    letter-spacing: 0.5px;
  }
}

.score-display {
  font-size: 36px;
  font-weight: 800;
  font-family: 'JetBrains Mono', 'Inter', system-ui;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  letter-spacing: -1px;

  &.positive {
    color: #f87171;
    text-shadow: 0 2px 12px rgba(248, 113, 113, 0.3);
  }
  &.negative {
    color: #8a9a5b;
    text-shadow: 0 2px 12px rgba(138, 154, 91, 0.3);
  }

  .sign {
    font-size: 24px;
    margin-right: 4px;
    opacity: 0.8;
  }
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(to top, rgba(23, 25, 30, 0.8), transparent);
  z-index: 10;
}

.log-bubble {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 13px;
  color: #e2e8f0;
  flex: 1;
  margin-right: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &.empty {
    background: transparent;
    border-color: transparent;
    color: rgba(255, 255, 255, 0.3);
    box-shadow: none;
  }
}

.console-area {
  background: #17191e;
  padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
  border-radius: 32px 32px 0 0;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
}

.input-preview {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 0 8px;

  .target-hint {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 500;

    .highlight {
      color: var(--color-primary);
      font-weight: 700;
      text-shadow: 0 0 10px rgba(138, 154, 91, 0.2);
    }
  }

  .amount-val {
    font-size: 48px;
    font-weight: 800;
    font-family: 'JetBrains Mono', system-ui;
    color: var(--color-primary);
    line-height: 1;
    letter-spacing: -2px;
  }
}

.chips-row {
  display: flex;
  margin-bottom: 16px;
}

.numpad-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

:deep(.num-btn) {
  height: 60px;
  background-color: #24272e !important;
  font-size: 26px !important;
  font-weight: 600 !important;
  color: #f8fafc !important;
  border-radius: 16px !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.02) !important;
}

:deep(.btn-c) {
  color: rgba(255, 255, 255, 0.4) !important;
  font-size: 22px !important;
}

:deep(.act-btn) {
  height: 60px;
  font-size: 16px !important;
  border-radius: 16px !important;
  color: #0f1115 !important;
  font-weight: 800 !important;
  letter-spacing: 1px !important;
}

:deep(.btn-win) {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2) !important;
  color: #fff !important;
}

:deep(.btn-lose) {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2) !important;
  color: #fff !important;
}

:deep(.btn-allin) {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2) !important;
  color: #fff !important;
}

:deep(.btn-end) {
  background: #333945 !important;
  color: #cbd5e1 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
}
</style>
