import { getDb } from '@/lib/mongodb'
import { FREE_DAILY_TOKENS, PREMIUM_DAILY_TOKENS, isPremiumModel } from '@/lib/models'

export type QuotaResult = { allowed: boolean; remaining: number; limit: number }

export async function checkAndConsumeTokens(userId: string | null, model: string, tokens: number): Promise<QuotaResult> {
  const db = await getDb()
  const collection = db.collection('usage')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const bucket = isPremiumModel(model) ? 'premium' : 'free'
  const limit = isPremiumModel(model) ? PREMIUM_DAILY_TOKENS : FREE_DAILY_TOKENS

  const key = { date: today.toISOString(), userId: userId || 'anon', bucket }

  const doc = await collection.findOneAndUpdate(
    key,
    {
      $setOnInsert: key,
      $inc: { tokens }
    },
    { upsert: true, returnDocument: 'after' }
  )

  const used = doc?.value?.tokens || 0
  const remaining = Math.max(0, limit - used)

  if (used > limit) {
    // revert increment
    await collection.updateOne(key, { $inc: { tokens: -tokens } })
    return { allowed: false, remaining, limit }
  }

  return { allowed: true, remaining, limit }
}
