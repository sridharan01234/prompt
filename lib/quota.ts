import fs from 'fs'
import path from 'path'
import { FREE_DAILY_TOKENS, PREMIUM_DAILY_TOKENS, isPremiumModel } from '@/lib/models'

export type QuotaResult = { allowed: boolean; remaining: number; limit: number }

const USAGE_FILE = path.join(process.cwd(), 'lib/usage.json')

function readUsage(): Record<string, number> {
  try {
    if (!fs.existsSync(USAGE_FILE)) {
      return {}
    }
    const data = fs.readFileSync(USAGE_FILE, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    console.error('Error reading usage JSON, returning empty', e)
    return {}
  }
}

function writeUsage(usage: Record<string, number>) {
  try {
    const dir = path.dirname(USAGE_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2), 'utf8')
  } catch (e) {
    console.error('Error writing usage JSON', e)
  }
}

export async function checkAndConsumeTokens(userId: string | null, model: string, tokens: number): Promise<QuotaResult> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateStr = today.toISOString().split('T')[0]

  const bucket = isPremiumModel(model) ? 'premium' : 'free'
  const limit = isPremiumModel(model) ? PREMIUM_DAILY_TOKENS : FREE_DAILY_TOKENS

  const key = `${dateStr}_${userId || 'anon'}_${bucket}`

  const usage = readUsage()
  const currentTokens = usage[key] || 0
  const nextTokens = currentTokens + tokens

  const remaining = Math.max(0, limit - nextTokens)

  if (nextTokens > limit) {
    const currentRemaining = Math.max(0, limit - currentTokens)
    return { allowed: false, remaining: currentRemaining, limit }
  }

  usage[key] = nextTokens
  writeUsage(usage)

  return { allowed: true, remaining, limit }
}
