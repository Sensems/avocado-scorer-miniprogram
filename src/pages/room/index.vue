<template>
  <view class="room-container">
    <view class="room-header">
      <view class="title">
        房间准备
      </view>
      <view class="room-id-badge">
        <text class="label">房间号</text>
        <text class="value">{{ roomId }}</text>
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

    <view class="actions">
      <HapticButton custom-style="width: 100%; height: 56px; background: #fdfbf7; border: 4px solid var(--color-border); color: var(--color-text-primary);" @click="showQrModal = true">
        <text class="btn-text" style="font-size: 16px; font-weight: 800;">微信分享 / 扫码入座</text>
      </HapticButton>

      <HapticButton
        type="primary"
        class="start-btn mt-4"
        custom-style="width: 100%; height: 56px;"
        :disabled="store.players.length < 4"
        @click="startGame"
      >
        <text class="btn-text" style="font-size: 16px; font-weight: 800;">{{ store.players.length < 4 ? '等待玩家入座...' : '开始对局' }}</text>
      </HapticButton>
    </view>

    <!-- 二维码弹窗 -->
    <view v-if="showQrModal" class="qr-modal" @click="showQrModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">邀请好友入场</text>
          <view class="close-btn" @click="showQrModal = false">
            ×
          </view>
        </view>
        <view class="qr-placeholder">
          <text class="qr-text">此处生成小程序码</text>
          <text class="qr-sub">房间号: {{ roomId }}</text>
        </view>
        <!-- 正常情况这是微信开放能力的 share-btn -->
        <button class="share-btn plain-btn" open-type="share">
          发送给微信好友
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { ref } from 'vue'
import HapticButton from '@/components/HapticButton.vue'
import { useScoringStore } from '@/store/useScoringStore'

defineOptions({ name: 'Room' })
definePage({
  style: {
    navigationBarTitleText: '房间准备',
    navigationBarBackgroundColor: '#1E1E1E',
    navigationBarTextStyle: 'white',
    backgroundColor: '#1E1E1E',
  },
})

const store = useScoringStore()
const roomId = ref('')
const maxPlayers = 4
const showQrModal = ref(false)

onLoad((options) => {
  if (options?.roomId) {
    roomId.value = options.roomId
    // 单机版不真实联网，只是本地拉起
    store.initGame(roomId.value)
  }
  else {
    roomId.value = Math.random().toString(36).substring(2, 8).toUpperCase()
    store.initGame(roomId.value)
  }
})

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
  uni.navigateTo({ url: '/pages/scoring/index' })
}

onShareAppMessage(() => {
  return {
    title: `🀄️ 牛油果记分 - 房间号 [${roomId.value}]，速来！`,
    path: `/pages/index/index?roomId=${roomId.value}`,
  }
})
</script>

<style lang="scss" scoped>
.room-container {
  min-height: 100vh;
  background-color: var(--bg-base);
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
}

.room-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;

  .title {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 24px;
    text-shadow: 2px 2px 0px var(--color-border);
  }

  .room-id-badge {
    display: inline-flex;
    align-items: center;
    background: #fdfbf7;
    border: 4px solid var(--color-border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 4px 4px 0px 0px var(--color-border);

    .label {
      background: var(--color-border);
      color: #fdfbf7;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 800;
    }
    .value {
      padding: 8px 20px;
      font-size: 20px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 2px;
    }
  }
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 340px;
  margin-bottom: 40px;
}

.player-seat {
  background: #fdfbf7;
  border-radius: 12px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid var(--color-border);
  box-shadow: 4px 4px 0px 0px var(--color-border);

  &.is-empty {
    border: 4px dashed var(--color-border);
    box-shadow: none;
    background: transparent;
  }
}

.avatar-filled {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fdfbf7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 12px;
  border: 3px solid var(--color-border);
  box-shadow: 2px 2px 0px 0px var(--color-border);

  &.virtual {
    background: transparent;
    border: 3px dashed var(--color-border);
    color: var(--color-text-secondary);
    box-shadow: none;
  }
}

.name {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.seat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-text-secondary);

  &:active {
    opacity: 0.7;
  }

  .plus {
    font-size: 32px;
    font-weight: 800;
    margin-bottom: 4px;
    line-height: 1;
  }
  .hint {
    font-size: 14px;
    font-weight: 800;
  }
}

.actions {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qr-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-content {
  width: 100%;
  max-width: 320px;
  background: #fdfbf7;
  border: 4px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 8px 8px 0px 0px var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;

  .modal-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .modal-title {
      font-size: 20px;
      font-weight: 800;
    }

    .close-btn {
      font-size: 24px;
      font-weight: 800;
      color: var(--color-text-secondary);
      padding: 4px;
      line-height: 1;
    }
  }

  .qr-placeholder {
    width: 200px;
    height: 200px;
    background: #eee;
    border: 4px dashed var(--color-border);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;

    .qr-text {
      font-size: 14px;
      font-weight: 800;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }
    .qr-sub {
      font-size: 16px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      color: var(--color-text-primary);
    }
  }

  .share-btn {
    width: 100%;
    height: 50px;
    background: var(--color-primary);
    color: #fdfbf7;
    border-radius: 8px;
    border: 3px solid var(--color-border);
    box-shadow: 4px 4px 0px 0px var(--color-border);
    font-size: 16px;
    font-weight: 800;
    line-height: 50px;
    text-align: center;
    &::after {
      border: none;
    }
  }
}
</style>
