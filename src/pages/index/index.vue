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

    <view class="action-area">
      <view class="join-room">
        <text class="label">输入房间号加入</text>
        <view class="room-input-container">
          <input
            v-model="inputRoomId"
            class="hidden-input"
            type="text"
            maxlength="6"
            :focus="isInputFocused"
            @blur="isInputFocused = false"
            @input="onInputRoomId"
          >
          <view class="fake-input-row" @click="focusInput">
            <view
              v-for="i in 6"
              :key="i"
              class="char-box"
              :class="{ active: inputRoomId.length === i - 1 && isInputFocused, filled: inputRoomId.length >= i }"
            >
              {{ inputRoomId[i - 1] || '' }}
            </view>
          </view>
        </view>
        <HapticButton
          type="primary"
          class="join-btn"
          custom-style="width: 100%; height: 56px; margin-bottom: 24px;"
          :disabled="inputRoomId.length !== 6"
          @click="joinRoom"
        >
          <text class="btn-text" style="font-size: 16px; font-weight: 800; letter-spacing: 2px;">加入对局</text>
        </HapticButton>
      </view>

      <view class="divider">
        <text class="line" />
        <text class="text">或</text>
        <text class="line" />
      </view>

      <HapticButton
        class="create-btn"
        custom-style="width: 100%; height: 56px; background: #fdfbf7; border: 4px solid var(--color-border); color: var(--color-text-primary);"
        @click="createRoom"
      >
        <text class="btn-text" style="font-size: 16px; font-weight: 800;">创建新对局</text>
      </HapticButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HapticButton from '@/components/HapticButton.vue'

defineOptions({ name: 'Home' })
definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTextStyle: 'white',
    backgroundColor: '#1E1E1E',
  },
})

const inputRoomId = ref('')
const isInputFocused = ref(false)

function focusInput() {
  isInputFocused.value = true
}

function onInputRoomId(e: any) {
  inputRoomId.value = e.detail.value.toUpperCase()
}

function joinRoom() {
  if (inputRoomId.value.length === 6) {
    uni.navigateTo({ url: `/pages/room/index?roomId=${inputRoomId.value}` })
  }
}

function createRoom() {
  uni.navigateTo({ url: '/pages/room/index' })
}
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
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  margin-top: 4vh;
}

.join-room {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  padding: 0;

  .label {
    font-size: 16px;
    font-weight: 800;
    color: var(--color-text-primary);
    margin-bottom: 16px;
  }

  .room-input-container {
    position: relative;
    width: 100%;
    margin-bottom: 24px;
  }

  .hidden-input {
    position: absolute;
    top: 0;
    left: -9999px;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .fake-input-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
  }

  .char-box {
    width: 48px;
    height: 60px;
    background: #fdfbf7;
    border: 3px solid var(--color-border);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    color: var(--color-text-primary);
    box-shadow: 4px 4px 0px 0px var(--color-border);
    transition: all 0.2s;

    &.filled {
      border-color: var(--color-text-primary);
    }

    &.active {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 4px 6px 0px 0px var(--color-primary);
    }
  }
}

.divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 16px 0;

  .line {
    flex: 1;
    height: 3px;
    background-color: var(--color-border);
  }

  .text {
    margin: 0 16px;
    font-size: 14px;
    font-weight: 800;
    color: var(--color-text-secondary);
  }
}
</style>
