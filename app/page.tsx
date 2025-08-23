import PromptPlaygroundModern from '@/components/PromptPlaygroundModern'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'

export default function HomePage() {
	return (
		<>
			<PromptPlaygroundModern />
			<Analytics />
			<SpeedInsights />
		</>
	)
}
