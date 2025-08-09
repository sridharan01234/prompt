import PromptPlayground from '@/components/PromptPlayground'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'

export default function HomePage() {
	return (
		<>
			<PromptPlayground />
			<Analytics />
			<SpeedInsights />
		</>
	)
}
