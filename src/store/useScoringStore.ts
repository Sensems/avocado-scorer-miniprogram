import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Player {
  id: string // 唯一标识
  name: string // 显示名字
  avatarUrl?: string // 头像，可选
  score: number // 当前总得分，可以为负
  isVirtual: boolean // 是否为替身
  ownerId?: string // 如果是替身，它的控制者房主ID
}

export interface ScoreLog {
  id: string
  fromId: string // 付款方
  fromName: string // 付款方姓名（冗余以便直接展示）
  toId: string // 收款方
  toName: string // 收款方姓名
  amount: number // 金额
  timestamp: number // 记录时间戳
}

export const useScoringStore = defineStore('scoring', () => {
  // --- State ---
  const players = ref<Player[]>([])
  const historyStack = ref<ScoreLog[]>([])
  const activeTargetId = ref<string | null>(null) // 当前选中的操作目标玩家

  // 房主/本机操作者ID
  const localOperatorId = ref<string>('local_user')

  // --- Getters ---
  // 获取最后一条操作流水（用于防呆气泡展示）
  const lastScoreLog = computed(() => {
    return historyStack.value.length > 0
      ? historyStack.value[historyStack.value.length - 1]
      : null
  })

  // --- Actions ---
  const setActiveTarget = (id: string) => {
    activeTargetId.value = activeTargetId.value === id ? null : id
  }

  const addPlayer = (player: Omit<Player, 'score'>) => {
    players.value.push({ ...player, score: 0 })
  }

  // 基础过账方法 (from: 输家, to: 赢家, amount: 积分)
  const addScore = (fromId: string, toId: string, amount: number) => {
    if (amount <= 0)
      return
    const from = players.value.find(p => p.id === fromId)
    const to = players.value.find(p => p.id === toId)

    if (!from || !to) {
      console.warn('Player not found in addScore', fromId, toId)
      return
    }

    // 更新分值
    from.score -= amount
    to.score += amount

    // 加入流水栈
    historyStack.value.push({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      fromId,
      fromName: from.name,
      toId,
      toName: to.name,
      amount,
      timestamp: Date.now(),
    })
  }

  // 全收核爆功能: 一家赢，另外三家全部扣底分
  const allIn = (winnerId: string, baseAmount: number) => {
    if (baseAmount <= 0)
      return
    const winner = players.value.find(p => p.id === winnerId)
    if (!winner)
      return

    let totalEarned = 0
    players.value.forEach((p) => {
      if (p.id !== winnerId) {
        p.score -= baseAmount
        totalEarned += baseAmount

        // 独立的流水记录，方便撤销/查看
        historyStack.value.push({
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          fromId: p.id,
          fromName: p.name,
          toId: winnerId,
          toName: winner.name,
          amount: baseAmount,
          timestamp: Date.now(),
        })
      }
    })

    winner.score += totalEarned
  }

  // 撤销最后一步流水
  const undoLastScore = () => {
    const lastLog = historyStack.value.pop()
    if (!lastLog)
      return

    const from = players.value.find(p => p.id === lastLog.fromId)
    const to = players.value.find(p => p.id === lastLog.toId)

    // 反向恢复分值
    if (from)
      from.score += lastLog.amount
    if (to)
      to.score -= lastLog.amount

    // 如果是因为全收导致的多条连续记录(时间戳极近)，可以考虑连续撤销。
    // 为了稳妥，这里提供简单的单条流水回滚。业务上如果需要整把撤销，可以在 UI 连击撤回。
  }

  // 初始化对局
  const initGame = (roomId: string) => {
    players.value = []
    historyStack.value = []
    activeTargetId.value = null
    // 假设自己是房主
    addPlayer({
      id: localOperatorId.value,
      name: '我(房主)',
      isVirtual: false,
      avatarUrl: '',
    })
  }

  return {
    players,
    historyStack,
    activeTargetId,
    localOperatorId,
    lastScoreLog,
    setActiveTarget,
    addPlayer,
    addScore,
    undoLastScore,
    allIn,
    initGame,
  }
})
