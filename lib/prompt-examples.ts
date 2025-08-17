/**
 * Enhanced Prompt Usage Examples with MCP Integration
 * 
 * This file demonstrates how to use the improved prompt-core.ts
 * with real MCP data to create context-aware, high-quality prompts.
 */

import { 
	createMCPEnhancedPrompt, 
	supportPrompt, 
	MCPContext, 
	SupportPromptType 
} from './prompt-core'

// Example 1: Using enhanced ANALYZE prompt with real code quality data
export async function analyzeCodeWithQualityContext() {
	// Mock MCP context (in real usage, this would come from actual MCP calls)
	const mcpContext: MCPContext = {
		codeQuality: {
			issues: [
				{
					category: "Security",
					severity: "High",
					message: "SQL injection vulnerability detected in user input handling",
					file: "lib/database.ts",
					line: 45
				},
				{
					category: "Performance",
					severity: "Medium", 
					message: "N+1 query pattern detected in user data fetching",
					file: "api/users/route.ts",
					line: 23
				}
			],
			metrics: {
				grade: "B",
				coverage: 78,
				duplication: 12,
				complexity: 8.2
			}
		},
		security: {
			vulnerabilities: [
				{
					severity: "Critical",
					category: "Input Validation",
					description: "Unsanitized user input passed directly to database query",
					remediation: "Use parameterized queries and input validation"
				}
			]
		}
	}

	const enhancedPrompt = await createMCPEnhancedPrompt(
		'ANALYZE',
		{
			language: 'TypeScript',
			userInput: `
function getUserData(userId: string) {
	const query = \`SELECT * FROM users WHERE id = \${userId}\`;
	return db.query(query);
}
			`
		},
		mcpContext
	)

	console.log('Enhanced ANALYZE prompt with MCP context:')
	console.log(enhancedPrompt)
	
	return enhancedPrompt
}

// Example 2: Using ENHANCE prompt with GitHub collaboration context
export async function enhancePromptWithGitHubContext() {
	const mcpContext: MCPContext = {
		github: {
			notifications: [
				{
					type: "review_requested",
					subject: "Review requested for PR #42: Implement user authentication",
					repository: "prompt-enhancement-platform",
					updated_at: "2025-01-17T10:30:00Z"
				},
				{
					type: "issue_assigned",
					subject: "Assigned to issue #15: Optimize database queries",
					repository: "prompt-enhancement-platform", 
					updated_at: "2025-01-17T09:15:00Z"
				}
			],
			pullRequests: [
				{
					title: "Implement user authentication with NextAuth",
					status: "open",
					url: "https://github.com/owner/repo/pull/42"
				}
			],
			issues: [
				{
					title: "Optimize database queries for better performance",
					status: "open",
					labels: ["performance", "database", "high-priority"]
				}
			]
		}
	}

	const enhancedPrompt = await createMCPEnhancedPrompt(
		'ENHANCE',
		{
			language: 'Next.js',
			userInput: 'Create a function to handle user login'
		},
		mcpContext
	)

	return enhancedPrompt
}

// Example 3: Using DEBUG prompt with sequential thinking context
export async function debugWithSystematicThinking() {
	const mcpContext: MCPContext = {
		reasoning: {
			thinking_process: "Hypothesis-driven debugging with systematic elimination",
			hypothesis: "Authentication failure likely caused by cookie domain mismatch or session timeout",
			verification: "Test auth flow in different browsers and check cookie settings",
			confidence_level: 0.85
		},
		codeQuality: {
			issues: [
				{
					category: "Authentication",
					severity: "High",
					message: "Missing fallback authentication mechanism",
					file: "lib/auth.ts",
					line: 67
				}
			]
		}
	}

	const enhancedPrompt = await createMCPEnhancedPrompt(
		'DEBUG',
		{
			language: 'Next.js',
			userInput: 'Users are getting randomly logged out during normal usage. The issue is intermittent and hard to reproduce.'
		},
		mcpContext
	)

	return enhancedPrompt
}

// Example 4: Using OPTIMIZE prompt with performance context
export async function optimizeWithPerformanceData() {
	const mcpContext: MCPContext = {
		codeQuality: {
			issues: [
				{
					category: "Performance",
					severity: "High",
					message: "Inefficient database query pattern causing slow response times",
					file: "api/generate/route.ts",
					line: 45
				},
				{
					category: "Memory",
					severity: "Medium",
					message: "Potential memory leak in streaming response handler",
					file: "lib/useStreamingApi.ts",
					line: 23
				}
			],
			metrics: {
				grade: "C",
				coverage: 65,
				duplication: 8,
				complexity: 12.5
			}
		}
	}

	const enhancedPrompt = await createMCPEnhancedPrompt(
		'OPTIMIZE',
		{
			language: 'Next.js',
			userInput: `
export async function POST(request: Request) {
	const { prompts } = await request.json();
	const results = [];
	
	for (const prompt of prompts) {
		const result = await processPrompt(prompt);
		results.push(result);
	}
	
	return Response.json(results);
}
			`
		},
		mcpContext
	)

	return enhancedPrompt
}

// Example 5: Using TEST prompt with comprehensive testing strategy
export async function createTestSuiteWithQualityContext() {
	const mcpContext: MCPContext = {
		codeQuality: {
			issues: [
				{
					category: "Testing",
					severity: "Medium",
					message: "Low test coverage in authentication module",
					file: "lib/auth.ts"
				},
				{
					category: "Security",
					severity: "High", 
					message: "Missing input validation tests for API endpoints",
					file: "app/api/"
				}
			],
			metrics: {
				grade: "C+",
				coverage: 45, // Low coverage indicating need for more tests
				duplication: 5,
				complexity: 9.1
			}
		},
		security: {
			vulnerabilities: [
				{
					severity: "High",
					category: "Input Validation",
					description: "API endpoints lack proper input sanitization testing"
				}
			]
		}
	}

	const enhancedPrompt = await createMCPEnhancedPrompt(
		'TEST',
		{
			language: 'Next.js',
			userInput: `
// Authentication API route
export async function POST(request: Request) {
	const { email, password } = await request.json();
	const user = await authenticateUser(email, password);
	
	if (!user) {
		return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
	}
	
	const session = await createSession(user.id);
	return NextResponse.json({ user, session });
}
			`
		},
		mcpContext
	)

	return enhancedPrompt
}

// Example 6: Using DOCUMENT prompt with comprehensive project context
export async function documentWithProjectContext() {
	const mcpContext: MCPContext = {
		github: {
			pullRequests: [
				{
					title: "Add comprehensive API documentation",
					status: "in_progress",
					url: "https://github.com/owner/repo/pull/38"
				}
			],
			issues: [
				{
					title: "Improve developer onboarding documentation",
					status: "open",
					labels: ["documentation", "developer-experience", "good-first-issue"]
				}
			]
		},
		codeQuality: {
			issues: [
				{
					category: "Documentation",
					severity: "Medium",
					message: "Missing API documentation for core endpoints"
				}
			]
		}
	}

	const enhancedPrompt = await createMCPEnhancedPrompt(
		'DOCUMENT',
		{
			language: 'Next.js',
			userInput: 'Next.js 14 prompt enhancement platform with OpenAI integration, user authentication, and quota management'
		},
		mcpContext
	)

	return enhancedPrompt
}

// Utility function to simulate real MCP data fetching
export async function fetchMCPContextForProject(
	organizationName: string,
	repositoryName: string
): Promise<MCPContext> {
	// In a real implementation, this would make actual MCP calls:
	// const codeQuality = await mcp_codacy_codacy_search_repository_srm_items(...)
	// const notifications = await mcp_github_list_notifications(...)
	// const reasoning = await mcp_sequentialthi_sequentialthinking(...)
	
	// For now, return mock data that represents what real MCP calls would return
	return {
		codeQuality: {
			issues: [],
			metrics: {
				grade: "A-",
				coverage: 85,
				duplication: 3,
				complexity: 6.2
			}
		},
		security: {
			vulnerabilities: []
		},
		github: {
			notifications: [],
			pullRequests: [],
			issues: []
		}
	}
}

// Integration example: Complete workflow with MCP data
export async function completeWorkflowExample() {
	const organizationName = "sridharan01234"
	const repositoryName = "prompt"
	
	// 1. Fetch real MCP context
	const mcpContext = await fetchMCPContextForProject(organizationName, repositoryName)
	
	// 2. Create enhanced prompts based on the context
	const prompts = {
		analyze: await createMCPEnhancedPrompt('ANALYZE', {
			language: 'TypeScript',
			userInput: 'Review the prompt-core.ts file for improvements'
		}, mcpContext),
		
		optimize: await createMCPEnhancedPrompt('OPTIMIZE', {
			language: 'Next.js',
			userInput: 'Improve the streaming API performance'
		}, mcpContext),
		
		test: await createMCPEnhancedPrompt('TEST', {
			language: 'Next.js',
			userInput: 'Create comprehensive tests for the quota management system'
		}, mcpContext)
	}
	
	return prompts
}

// Export all examples for easy testing
export const promptExamples = {
	analyzeCodeWithQualityContext,
	enhancePromptWithGitHubContext,
	debugWithSystematicThinking,
	optimizeWithPerformanceData,
	createTestSuiteWithQualityContext,
	documentWithProjectContext,
	completeWorkflowExample
}
