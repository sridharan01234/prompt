export const LIMITED_MODELS = [
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-4o-mini',
  'o1-mini',
  'o3-mini',
  'o4-mini',
  'codex-mini-latest'
]

export const PREMIUM_MODELS = [
  'gpt-5',
  'gpt-5-chat-latest',
  'gpt-4.1',
  'gpt-4o',
  'o1',
  'o3'
]

export const FREE_DAILY_TOKENS = 2_500_000 // 2.5M per day across limited models
export const PREMIUM_DAILY_TOKENS = 250_000 // 250k per day across premium models

export const isPremiumModel = (model: string) => PREMIUM_MODELS.includes(model)
export const isLimitedModel = (model: string) => LIMITED_MODELS.includes(model)

export const ALL_MODELS = [...LIMITED_MODELS, ...PREMIUM_MODELS]
