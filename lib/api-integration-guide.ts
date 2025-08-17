// @ts-nocheck

/**
 * Integration Guide: Enhanced Prompts with MCP in API Routes
 * 
 * This file shows how to integrate the enhanced prompt system
 * with MCP data fetching in your Next.js API routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createMCPEnhancedPrompt, MCPContext, SupportPromptType } from '@/lib/prompt-core'

// Example: Enhanced /api/generate route with MCP integration
export async function POST(request: NextRequest) {
	try {
		// 1. Extract request data
		const { prompt, model, type } = await request.json()
		
		// 2. Authentication check (existing logic)
		const session = await getServerSession(authOptions)
		let userId = (session as any)?.userId || null
		let authed = Boolean(session)

		// Custom Google auth cookie fallback (existing logic)
		if (!authed) {
			const googleAuthCookie = request.cookies.get('google-auth-user')
			if (googleAuthCookie?.value) {
				try {
					const userData = JSON.parse(googleAuthCookie.value)
					if (userData.email && userData.sub) {
						userId = userData.sub
						authed = true
					}
				} catch (e) { /* Invalid cookie */ }
			}
		}

		// 3. Model validation (existing logic)
		if (isPremiumModel(model) && !authed) {
			return NextResponse.json({ error: 'Premium model requires authentication' }, { status: 403 })
		}

		// 4. Quota check (existing logic)
		const quotaResult = await checkAndConsumeTokens(userId, model, 1000)
		if (!quotaResult.success) {
			return NextResponse.json({ error: quotaResult.message }, { status: 429 })
		}

		// 5. NEW: Fetch MCP context data
		const mcpContext = await fetchMCPContext(userId, request)

		// 6. NEW: Create enhanced prompt with MCP context
		const enhancedPrompt = await createMCPEnhancedPrompt(
			type as SupportPromptType,
			{
				language: detectLanguageFromPrompt(prompt) || 'JavaScript',
				userInput: prompt
			},
			mcpContext
		)

		// 7. Generate response using enhanced prompt (existing OpenAI logic)
		const response = await generateWithOpenAI(enhancedPrompt, model)

		return new Response(response, {
			headers: { 'Content-Type': 'text/plain' }
		})

	} catch (error) {
		console.error('Enhanced prompt generation error:', error)
		return NextResponse.json(
			{ error: 'Failed to generate enhanced prompt' },
			{ status: 500 }
		)
	}
}

// Helper function to fetch MCP context
async function fetchMCPContext(userId: string | null, request: NextRequest): Promise<MCPContext> {
	const mcpContext: MCPContext = {}

	try {
		// Get repository info from request headers or user preferences
		const repoHeader = request.headers.get('x-repository')
		const { owner, repo } = parseRepositoryInfo(repoHeader, userId)

		if (owner && repo) {
			// Fetch MCP data in parallel for better performance
			const [codeQuality, security, github] = await Promise.allSettled([
				fetchCodeQualityData(owner, repo),
				fetchSecurityData(owner, repo),
				fetchGitHubData(owner, repo)
			])

			// Add successful results to context
			if (codeQuality.status === 'fulfilled' && codeQuality.value) {
				mcpContext.codeQuality = codeQuality.value
			}

			if (security.status === 'fulfilled' && security.value) {
				mcpContext.security = security.value
			}

			if (github.status === 'fulfilled' && github.value) {
				mcpContext.github = github.value
			}
		}

	} catch (error) {
		console.warn('MCP context fetch failed, continuing without context:', error)
	}

	return mcpContext
}

// MCP data fetching functions
async function fetchCodeQualityData(owner: string, repo: string) {
	try {
		// Use the Codacy MCP to get code quality data
		const issues = await mcp_codacy_codacy_search_repository_srm_items({
			provider: 'gh',
			organization: owner,
			repository: repo,
			options: {
				statuses: ['OnTrack', 'DueSoon', 'Overdue']
			}
		})

		return {
			issues: issues.data?.map((item: any) => ({
				category: item.category || 'Unknown',
				severity: item.priority || 'Medium',
				message: item.description || 'Code quality issue detected',
				file: item.file,
				line: item.line
			})) || [],
			metrics: {
				grade: 'B+', // Would come from Codacy metrics API
				coverage: 78,
				duplication: 5,
				complexity: 7.2
			}
		}
	} catch (error) {
		console.warn('Failed to fetch code quality data:', error)
		return null
	}
}

async function fetchSecurityData(owner: string, repo: string) {
	try {
		// Use the Codacy security MCP to get vulnerability data
		const vulnerabilities = await mcp_codacy_codacy_search_repository_srm_items({
			provider: 'gh',
			organization: owner,
			repository: repo,
			options: {
				scanTypes: ['SAST', 'Secrets', 'SCA'],
				statuses: ['OnTrack', 'DueSoon', 'Overdue']
			}
		})

		return {
			vulnerabilities: vulnerabilities.data?.map((item: any) => ({
				severity: item.priority as 'Low' | 'Medium' | 'High' | 'Critical',
				category: item.category || 'Security',
				description: item.description || 'Security vulnerability detected',
				remediation: item.remediation
			})) || []
		}
	} catch (error) {
		console.warn('Failed to fetch security data:', error)
		return null
	}
}

async function fetchGitHubData(owner: string, repo: string) {
	try {
		// Use GitHub MCP to get collaboration context
		const [notifications, pullRequests, issues] = await Promise.allSettled([
			mcp_github_list_notifications({ owner, repo }),
			mcp_github_list_pull_requests({ owner, repo, state: 'open' }),
			mcp_github_list_issues({ owner, repo, state: 'OPEN' })
		])

		return {
			notifications: notifications.status === 'fulfilled' ? 
				notifications.value?.slice(0, 5).map((notif: any) => ({
					type: notif.reason || 'notification',
					subject: notif.subject?.title || 'GitHub notification',
					repository: notif.repository?.full_name || `${owner}/${repo}`,
					updated_at: notif.updated_at
				})) : [],
			
			pullRequests: pullRequests.status === 'fulfilled' ?
				pullRequests.value?.slice(0, 3).map((pr: any) => ({
					title: pr.title,
					status: pr.state,
					url: pr.html_url
				})) : [],
			
			issues: issues.status === 'fulfilled' ?
				issues.value?.slice(0, 3).map((issue: any) => ({
					title: issue.title,
					status: issue.state,
					labels: issue.labels?.map((label: any) => label.name) || []
				})) : []
		}
	} catch (error) {
		console.warn('Failed to fetch GitHub data:', error)
		return null
	}
}

// Helper functions
function parseRepositoryInfo(repoHeader: string | null, userId: string | null): { owner?: string, repo?: string } {
	if (repoHeader) {
		const [owner, repo] = repoHeader.split('/')
		return { owner, repo }
	}
	
	// Could also derive from user preferences or project context
	// For now, return empty if not provided in header
	return {}
}

function detectLanguageFromPrompt(prompt: string): string | null {
	// Simple language detection based on keywords and patterns
	const languages = {
		'TypeScript': /typescript|\.ts|interface|type\s+\w+|export\s+type/i,
		'JavaScript': /javascript|\.js|function\s*\(|const\s+\w+\s*=/i,
		'React': /react|jsx|usestate|useeffect|component/i,
		'Next.js': /next\.js|next|app\s+router|api\s+route|getserversideprops/i,
		'Python': /python|\.py|def\s+\w+|import\s+\w+|from\s+\w+\s+import/i,
		'Java': /java|class\s+\w+|public\s+static|@override/i,
		'C#': /c#|csharp|namespace|using\s+system|public\s+class/i,
		'Go': /golang?|func\s+\w+|package\s+main|import\s+"/i,
		'Rust': /rust|fn\s+\w+|let\s+mut|pub\s+struct/i
	}

	for (const [language, pattern] of Object.entries(languages)) {
		if (pattern.test(prompt)) {
			return language
		}
	}

	return null
}

// Mock functions - replace with actual implementations
async function checkAndConsumeTokens(userId: string | null, model: string, tokens: number) {
	// Your existing quota implementation
	return { success: true }
}

function isPremiumModel(model: string): boolean {
	// Your existing model validation logic
	return model.includes('gpt-4')
}

async function generateWithOpenAI(prompt: string, model: string): Promise<string> {
	// Your existing OpenAI integration
	return 'Generated response...'
}

// Additional API route for fetching MCP status
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const owner = searchParams.get('owner')
		const repo = searchParams.get('repo')

		if (!owner || !repo) {
			return NextResponse.json({ error: 'Missing owner or repo parameters' }, { status: 400 })
		}

		const mcpContext = await fetchMCPContext(null, request)

		return NextResponse.json({
			success: true,
			context: mcpContext,
			timestamp: new Date().toISOString()
		})

	} catch (error) {
		console.error('MCP status fetch error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch MCP status' },
			{ status: 500 }
		)
	}
}

// Export types for use in other files
export type { MCPContext, SupportPromptType }
