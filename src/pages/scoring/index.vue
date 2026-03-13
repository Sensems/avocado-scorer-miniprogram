<template>
  <view class="scoring-board">
    <!-- Custom Header -->
    <view class="custom-header" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="capsule-wrapper">
        <view class="capsule-btn" @click="leaveRoom">
          <text class="icon">🚶</text>
        </view>
        <view class="capsule-divider" />
        <view class="capsule-btn" @click="openSettings">
          <text class="icon">⚙️</text>
        </view>
      </view>
      <view class="header-title">
        房间
      </view>
      <view class="capsule-wrapper placeholder" />
    </view>

    <!-- 弹性横向滚动阵列 -->
    <scroll-view class="players-grid-scroll" scroll-x :show-scrollbar="false">
      <view class="players-track">
        <view
          v-for="player in store.players" :key="player.id" class="player-card" :class="{
            'active': store.activeTargetId === player.id,
            'is-me': player.id === store.localOperatorId,
          }" @click="selectPlayer(player.id)"
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
              <NumberScroller :value="player.score" :height="28" class="scroller" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 操作流水区 (带框线优化设计) -->
    <view class="log-box-wrapper">
      <view class="log-box-inner">
        <scroll-view class="log-scroll-area" scroll-y>
          <view class="log-list">
            <view v-for="log in store.historyStack.slice().reverse()" :key="log.id" class="log-item">
              <view class="log-content">
                <text class="time">
                  {{ new Date(log.timestamp).toLocaleTimeString('zh-CN', {
                    hour12: false,
                    hour:
                      '2-digit',
                    minute: '2-digit',
                    second: '2-digit' }) }}
                </text>
                <text class="detail">{{ log.toName }} 收 {{ log.fromName }}</text>
                <text class="amount highlight" :class="{ positive: log.amount > 0 }">
                  {{ log.amount > 0 ? '+' : '' }}{{
                    log.amount }}
                </text>
              </view>
              <view v-if="log.id === store.lastScoreLog?.id" class="undo-btn" @click.stop="undo">
                撤销
              </view>
            </view>
            <view v-if="store.historyStack.length === 0" class="empty-hint">
              暂无记分记录
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- Skyline Draggable Sheet -->
    <!-- #ifdef MP-WEIXIN -->
    <draggable-sheet
      class="bottom-sheet" :initial-child-size="0.22" :min-child-size="0.22" :max-child-size="0.75"
      :snap="true"
    >
      <scroll-view class="sheet-scroll" scroll-y type="list" :show-scrollbar="false">
        <view class="console-area">
          <!-- 拖拽拉手区 -->
          <view class="drag-handle-wrapper">
            <view class="drag-handle" />
          </view>

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

          <view class="console-body">
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
      </scroll-view>
    </draggable-sheet>
    <!-- #endif -->
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

// 获取系统信息，用于自定义状态栏留空
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(systemInfo.statusBarHeight || 44)

const currentTargetName = computed(() => {
  const target = store.players.find((p: any) => p.id === store.activeTargetId)
  return target ? target.name : ''
})

function leaveRoom() {
  uni.navigateBack()
}

function openSettings() {
  uni.showToast({ title: '设置功能开发中', icon: 'none' })
}

function selectPlayer(id: string) {
  if (id === store.localOperatorId) {
    store.setActiveTarget(id)
    return
  }
  store.setActiveTarget(id)
}

function appendNum(n: string) {
  if (currentInput.value.length > 5)
    return
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
    store.addScore(store.activeTargetId, store.localOperatorId, val)
  }
  else {
    store.addScore(store.localOperatorId, store.activeTargetId, val)
  }

  uni.vibrateShort({ success: () => console.log('vibrate success') })
  currentInput.value = ''
  // 收满后不收起展开面板，连续操作
}

function confirmAllIn() {
  const baseAmount = Number(currentInput.value)
  if (!baseAmount || baseAmount <= 0) {
    uni.showToast({ title: '请输入底分金额', icon: 'none' })
    return
  }

  const winnerId = store.activeTargetId || store.localOperatorId
  store.allIn(winnerId, baseAmount)
  uni.vibrateShort({ success: () => console.log('vibrate success') })
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
  position: relative;
}

.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 12px;
  background-color: transparent;
  z-index: 50;

  .capsule-wrapper {
    display: flex;
    align-items: center;
    background: rgba(253, 251, 247, 0.9);
    border-radius: 32px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 6px 14px;
    width: 86px;
    justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &.placeholder {
      opacity: 0;
      pointer-events: none;
    }
  }

  .capsule-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      font-size: 18px;
    }
  }

  .capsule-divider {
    width: 1px;
    height: 16px;
    background: rgba(0, 0, 0, 0.1);
  }

  .header-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--color-text-primary);
  }
}

.players-grid-scroll {
  width: 100%;
  white-space: nowrap;
  padding-bottom: 8px;
  flex-shrink: 0;
}

.players-track {
  display: flex;
  gap: 8px;
  /* 减小间距 */
  padding: 12px 12px 0;
  /* 减小两侧边距 */
  width: 100%;
  box-sizing: border-box;
}

.player-card {
  flex: 1;
  /* 平分空间 */
  min-width: 0;
  /* 允许压缩以平分 flex */
  background: #fdfbf7;
  border-radius: 12px;
  position: relative;
  transition:
    transform 150ms ease,
    box-shadow 150ms ease;
  border: 3px solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 4px;
  /* 减小上下左右内边距 */
  box-shadow: 2px 2px 0px 0px var(--color-border);
  /* 减小阴影占位 */

  &.active {
    box-shadow: 4px 4px 0px 0px var(--color-border);
    transform: translateY(-4px) scale(1.02);
    border-color: var(--color-primary);
  }

  &.is-me {
    &::after {
      content: '我';
      position: absolute;
      top: -3px;
      right: -3px;
      background: var(--color-primary);
      color: #fdfbf7;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border: 3px solid var(--color-border);
      border-radius: 0 10px 0 10px;
    }
  }
}

.card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.p-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  .avatar-sm {
    width: 26px;
    /* 进一步缩小头像以挤出横向空间 */
    height: 26px;
    border-radius: 6px;
    background: var(--color-primary);
    border: 2px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    color: #fdfbf7;
  }

  .name {
    font-size: 11px;
    /* 缩小字号 */
    font-weight: 800;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}

.score-display {
  font-size: 20px;
  /* 缩小分数字号，之前太大挤压空间 */
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
    font-size: 16px;
    margin-right: 2px;
    opacity: 0.8;
  }
}

.log-box-wrapper {
  flex: 1;
  padding: 12px 16px 20vh;
  /* 留出底部 Skyline Sheet 空间 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.log-box-inner {
  flex: 1;
  background: #fdfbf7;
  border-radius: 16px;
  border: 4px solid var(--color-border);
  box-shadow: 6px 6px 0px 0px var(--color-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.log-scroll-area {
  flex: 1;
  padding: 12px;
  height: 100%;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 24px;
}

.log-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 3px solid var(--color-border);
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 2px 2px 0px 0px var(--color-border);

  .log-content {
    display: flex;
    align-items: center;
    gap: 12px;

    .time {
      font-size: 12px;
      color: var(--color-text-secondary);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
    }

    .detail {
      font-size: 14px;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .amount {
      font-size: 16px;
      font-weight: 800;

      &.positive {
        color: var(--color-danger);
      }
    }
  }

  .undo-btn {
    font-size: 13px;
    font-weight: 800;
    color: #fdfbf7;
    background: var(--color-danger);
    padding: 4px 12px;
    border-radius: 6px;
    border: 3px solid var(--color-border);
    box-shadow: 2px 2px 0px 0px var(--color-border);

    &:active {
      transform: translate(2px, 2px);
      box-shadow: 0px 0px 0px 0px var(--color-border);
    }
  }
}

.empty-hint {
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  font-weight: 800;
  color: var(--color-text-secondary);
}

.bottom-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.sheet-scroll {
  width: 100%;
  height: 100%;
  background: #f1ede1;
  /* 稍有区分度的背景 */
  border-radius: 24px 24px 0 0;
  border-top: 4px solid var(--color-border);
  box-shadow: 0 -8px 0px -4px var(--color-border);
  box-sizing: border-box;
}

.console-area {
  padding: 0 20px calc(24px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.drag-handle-wrapper {
  width: 100%;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.drag-handle {
  width: 48px;
  height: 6px;
  background: var(--color-text-secondary);
  border-radius: 4px;
  opacity: 0.3;
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

.console-body {
  overflow: visible;
  padding-bottom: 24px;
}

.chips-row {
  display: flex;
  margin-bottom: 16px;
}

.numpad-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding-bottom: 8px;
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
