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
          :class="{ 'is-empty': !store.players[index] }"
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
  background-color: var(--bg-base);
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
    color: var(--color-text-primary);
    margin-bottom: 8px;
    letter-spacing: -0.5px;
    text-shadow: 4px 4px 0px var(--color-primary);
    border: 4px solid var(--color-border);
    padding: 12px 24px;
    border-radius: 12px;
    background: #fdfbf7;
    box-shadow: 6px 6px 0px 0px var(--color-border);
  }

  .subtitle {
    font-size: 15px;
    font-weight: 800;
    color: var(--color-text-secondary);
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
  /* Other styles inherited from HapticButton primary */

  .btn-text {
    font-size: 18px;
    font-weight: 800;
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
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 24px;
  font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
  background: var(--bg-base);
  border: 4px solid var(--color-border);
  padding: 8px 20px;
  border-radius: 12px;
  letter-spacing: 2px;
  box-shadow: 4px 4px 0px 0px var(--color-border);
}

.qr-placeholder {
  width: 160px;
  height: 160px;
  background: var(--bg-base);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  border: 4px solid var(--color-border);
  box-shadow: 6px 6px 0px 0px var(--color-border);
  position: relative;

  .qr-text {
    color: var(--color-text-secondary);
    font-weight: 800;
    font-size: 16px;
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
  background: var(--bg-base);
  border-radius: 12px;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid var(--color-border);
  box-shadow: 6px 6px 0px 0px var(--color-border);

  &.is-empty {
    border: 4px dashed var(--color-border);
    box-shadow: none;
    background: transparent;
  }
}

.avatar-filled {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fdfbf7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 10px;
  border: 2px solid var(--color-border);
  box-shadow: 2px 2px 0px 0px var(--color-border);

  &.virtual {
    background: transparent;
    border: 2px dashed var(--color-border);
    color: var(--color-text-secondary);
    box-shadow: none;
  }
}

.name {
  font-size: 14px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.seat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-text-secondary);

  &:active {
    color: var(--color-text-primary);
  }

  .plus {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 6px;
    line-height: 1;
  }
  .hint {
    font-size: 13px;
    font-weight: 800;
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
