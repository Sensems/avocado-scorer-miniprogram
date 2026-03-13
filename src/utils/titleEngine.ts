import type { Player, ScoreLog } from '@/store/useScoringStore'

export interface TitleResult {
  playerId: string
  name: string
  score: number
  level: number // 1-5 优先级
  wordInfo: string
}

export const TITLE_DESC = {
  1: ['无情收割机', '发牌员的亲骨肉', '今晚全场的消费由TA买单', '退役赌神·民间分身'],
  2: ['感动中国·年度大善人', '精准扶贫办公室主任', '人形行走的 ATM 机', '散财金童'],
  3: ['海底捞月祖师爷', '爽文男主剧本', '隐忍一整晚，只为这一刻'],
  4: ['A股模拟器资深玩家', '仰卧起坐锦标赛冠军', '主打一个陪伴与心跳'],
  5: ['金牌陪跑员', '佛系打工仔', '无效摸牌体验官', '重在参与奖终身成就者'],
}

export function generateTitles(players: Player[], logs: ScoreLog[]): TitleResult[] {
  const result: TitleResult[] = []

  let totalWin = 0
  let totalLose = 0
  players.forEach((p) => {
    if (p.score > 0)
      totalWin += p.score
    if (p.score < 0)
      totalLose += Math.abs(p.score)
  })

  // 简易历史极值模拟 (MVP 简化处理，真实逻辑需遍历 logs 计算每个人的时序分值变化)

  players.forEach((p) => {
    let level = 5

    // Level 1: 绝对统治者
    if (p.score > 0 && p.score >= totalLose * 0.6) {
      level = 1
    }
    // Level 2: 终极慈善家
    else if (p.score < 0 && Math.abs(p.score) >= totalWin * 0.6) {
      level = 2
    }
    // Level 3 & 4
    else if (p.score > 0) {
      level = Math.random() > 0.5 ? 3 : 4
    }
    else {
      level = 5
    }

    const words = TITLE_DESC[level as keyof typeof TITLE_DESC]
    const wordInfo = words[Math.floor(Math.random() * words.length)]

    result.push({
      playerId: p.id,
      name: p.name,
      score: p.score,
      level,
      wordInfo,
    })
  })

  return result.sort((a, b) => b.score - a.score)
}
