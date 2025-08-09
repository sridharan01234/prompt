import OpenAI from 'openai'

export const getOpenAI = () => {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not set. Set NEXT_PUBLIC_OPENAI_API_KEY or OPENAI_API_KEY.')
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY })
}
