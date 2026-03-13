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
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 1500)
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
  background-color: var(--bg-base);
  color: var(--color-text-primary);
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
  background: #fdfbf7;
  border-radius: 12px;
  position: relative;
  transition:
    transform 150ms ease,
    box-shadow 150ms ease;
  border: 4px solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
  box-shadow: 4px 4px 0px 0px var(--color-border);

  &.active {
    box-shadow: 8px 8px 0px 0px var(--color-border);
    transform: translateY(-4px) scale(1.02);
  }

  &.is-me {
    &::after {
      content: '我';
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--color-primary);
      color: #fdfbf7;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border: 4px solid var(--color-border);
      border-radius: 0 10px 0 10px;
      box-shadow: -2px 2px 0px var(--color-border);
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
    border-radius: 8px;
    background: var(--color-primary);
    border: 3px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: #fdfbf7;
    box-shadow: 2px 2px 0px var(--color-border);
  }
  .name {
    font-size: 15px;
    font-weight: 800;
    color: var(--color-text-primary);
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
    color: var(--color-danger);
  }
  &.negative {
    color: var(--color-primary);
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
  background: transparent;
  z-index: 10;
}

.log-bubble {
  background: #fdfbf7;
  border: 4px solid var(--color-border);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 800;
  color: var(--color-text-primary);
  flex: 1;
  margin-right: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 4px 4px 0px 0px var(--color-border);

  &.empty {
    background: transparent;
    border: 4px dashed var(--color-border);
    color: var(--color-text-secondary);
    box-shadow: none;
  }
}

.console-area {
  background: #fdfbf7;
  padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
  border-top: 4px solid var(--color-border);
  box-shadow: 0 -8px 0px -4px var(--color-border);
  position: relative;
  z-index: 10;
}

.input-preview {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 0 8px;

  .target-hint {
    font-size: 15px;
    color: var(--color-text-secondary);
    font-weight: 800;

    .highlight {
      color: var(--color-primary);
      text-shadow: 2px 2px 0px var(--color-border);
      -webkit-text-stroke: 1px var(--color-border);
    }
  }

  .amount-val {
    font-size: 48px;
    font-weight: 800;
    font-family: 'JetBrains Mono', system-ui;
    color: var(--color-text-primary);
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
  background-color: #fdfbf7 !important;
  font-size: 26px !important;
  font-weight: 800 !important;
  color: var(--color-text-primary) !important;
  border-radius: 8px !important;
  box-shadow: 4px 4px 0px 0px var(--color-border) !important;
  border: 4px solid var(--color-border) !important;

  &:active {
    box-shadow: 2px 2px 0px 0px var(--color-border) !important;
    transform: translate(2px, 2px) !important;
  }
}

:deep(.btn-c) {
  color: var(--color-danger) !important;
  font-size: 22px !important;
}

:deep(.act-btn) {
  height: 60px;
  font-size: 16px !important;
  border-radius: 8px !important;
  color: #fdfbf7 !important;
  font-weight: 800 !important;
  letter-spacing: 1px !important;
  border: 4px solid var(--color-border) !important;
  box-shadow: 4px 4px 0px 0px var(--color-border) !important;

  &:active {
    box-shadow: 2px 2px 0px 0px var(--color-border) !important;
    transform: translate(2px, 2px) !important;
  }
}

:deep(.btn-win) {
  background: var(--color-primary) !important;
}

:deep(.btn-lose) {
  background: var(--color-danger) !important;
}

:deep(.btn-allin) {
  background: repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #d97706 10px, #d97706 20px) !important;
  color: var(--color-text-primary) !important;
  text-shadow: 1px 1px 0px #fff;
}

:deep(.btn-end) {
  background: #ebe5e0 !important;
  color: var(--color-text-primary) !important;
  font-size: 14px !important;
}
</style>
