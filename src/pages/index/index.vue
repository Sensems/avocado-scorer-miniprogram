<template>
  <view class="lobby-container">
    <view class="header">
      <view class="title">
        牛油果记分
      </view>
      <view class="subtitle">
        极速。沉浸。零摩擦。
      </view>
    </view>

    <view v-if="!isRoomCreated" class="action-area">
      <HapticButton type="primary" class="main-btn" @click="createRoom">
        <text class="btn-text">创建对局</text>
      </HapticButton>
    </view>

    <view v-else class="room-area">
      <view class="room-id">
        房间号: {{ roomId }}
      </view>
      <view class="qr-placeholder">
        <view class="qr-text">
          微信扫码入座
        </view>
      </view>

      <view class="players-grid">
        <view
          v-for="(player, index) in maxPlayers"
          :key="index"
          class="player-seat"
        >
          <template v-if="store.players[index]">
            <view class="avatar-filled" :class="{ virtual: store.players[index].isVirtual }">
              {{ store.players[index].name[0] }}
            </view>
            <view class="name">
              {{ store.players[index].name }}
            </view>
          </template>
          <template v-else>
            <view class="seat-empty" @click="addVirtualPlayer(index)">
              <text class="plus">+</text>
              <text class="hint">添加替身</text>
            </view>
          </template>
        </view>
      </view>

      <view class="start-action mt-8">
        <HapticButton
          type="primary"
          :disabled="store.players.length < 4"
          @click="startGame"
        >
          <text class="btn-text">{{ store.players.length < 4 ? '等待玩家入座...' : '开始对局' }}</text>
        </HapticButton>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { ref } from 'vue'
import HapticButton from '@/components/HapticButton.vue'
import { useScoringStore } from '@/store/useScoringStore'

defineOptions({ name: 'Home' })
definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTextStyle: 'white',
    backgroundColor: '#1E1E1E',
  },
})

const store = useScoringStore()
const isRoomCreated = ref(false)
const roomId = ref('')
const maxPlayers = 4

onLoad((options) => {
  // 处理扫码或分享链接进入的情形
  if (options?.roomId) {
    roomId.value = options.roomId
    isRoomCreated.value = true
    // TODO: 调用接口加入房间，这里先走单机逻辑
    store.initGame(roomId.value)
  }
})

function createRoom() {
  roomId.value = Math.random().toString(36).substring(2, 8).toUpperCase()
  isRoomCreated.value = true
  store.initGame(roomId.value) // 已把自己初始化进来
}

function addVirtualPlayer(index: number) {
  const vCount = store.players.filter(p => p.isVirtual).length + 1
  store.addPlayer({
    id: `virtual_${Date.now()}`,
    name: `替身${vCount}`,
    isVirtual: true,
    ownerId: store.localOperatorId,
    avatarUrl: '',
  })
}

function startGame() {
  if (store.players.length < 4) {
    uni.showToast({ title: '人未齐，不可开局', icon: 'error' })
    return
  }
  // 跳转到核心记分台
  uni.navigateTo({ url: '/pages/scoring/index' })
}

onShareAppMessage(() => {
  return {
    title: '🀄️ 缺一门，速来落座，牛油果极速记分！',
    path: `/pages/index/index?roomId=${roomId.value}`,
  }
})
</script>

<style lang="scss" scoped>
.lobby-container {
  min-height: 100vh;
  background-color: #0f1115; /* 极深邃底色 */
  background-image:
    radial-gradient(circle at 15% 50%, rgba(138, 154, 91, 0.08), transparent 25%),
    radial-gradient(circle at 85% 30%, rgba(124, 58, 237, 0.05), transparent 25%);
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10vh 24px 40px;
  position: relative;
  overflow: hidden;
}

.header {
  text-align: center;
  margin-bottom: 48px;
  z-index: 10;

  .title {
    font-size: 42px;
    font-weight: 800;
    font-family:
      'Inter',
      system-ui,
      -apple-system,
      sans-serif;
    color: transparent;
    background-image: linear-gradient(135deg, #b5c58a 0%, #8a9a5b 100%);
    -webkit-background-clip: text;
    background-clip: text;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
    text-shadow: 0 4px 24px rgba(138, 154, 91, 0.2);
  }

  .subtitle {
    font-size: 15px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 4px;
    text-transform: uppercase;
  }
}

.action-area {
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 10;
  margin-top: 20vh;
}

.main-btn {
  width: 260px;
  height: 64px;
  border-radius: 32px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 12px 32px -8px rgba(138, 154, 91, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);

  /* 按钮内发光特效点缀 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
    border-radius: inherit;
    pointer-events: none;
  }

  .btn-text {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 2px;
    position: relative;
    z-index: 2;
  }
}

.room-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.room-id {
  font-size: 16px;
  color: #fff;
  margin-bottom: 24px;
  font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 8px 20px;
  border-radius: 100px;
  letter-spacing: 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.qr-placeholder {
  width: 160px;
  height: 160px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, rgba(138, 154, 91, 0.2), transparent, transparent, rgba(138, 154, 91, 0.2));
    border-radius: 22px;
    z-index: -1;
  }

  .qr-text {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 1px;
  }
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 340px;
}

.player-seat {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 24px;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.avatar-filled {
  width: 44px;
  height: 44px;
  border-radius: 18px;
  background: linear-gradient(135deg, #b5c58a, #8a9a5b);
  color: #0f1115;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(138, 154, 91, 0.3);

  &.virtual {
    background: rgba(138, 154, 91, 0.1);
    border: 1.5px dashed rgba(138, 154, 91, 0.6);
    color: #8a9a5b;
    box-shadow: none;
  }
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.seat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.3);
  transition: color 0.2s ease;

  &:active {
    color: rgba(255, 255, 255, 0.8);
  }

  .plus {
    font-size: 28px;
    font-weight: 300;
    margin-bottom: 6px;
    line-height: 1;
  }
  .hint {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
}

.start-action {
  width: 100%;
  max-width: 340px;

  .main-btn {
    width: 100%;
  }
}
</style>
