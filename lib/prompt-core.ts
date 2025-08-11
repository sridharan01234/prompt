// Support prompts
export type PromptParams = Record<string, string | any[]>

const generateDiagnosticText = (diagnostics?: any[]) => {
	if (!diagnostics?.length) return ""
	return `\nCurrent problems detected:\n${diagnostics
		.map((d) => `- [${d.source || "Error"}] ${d.message}${d.code ? ` (${d.code})` : ""}`)
		.join("\n")}`
}

export const createPrompt = (template: string, params: PromptParams): string => {
	return template.replace(/\$\{(.*?)\}/g, (_, key) => {
		if (key === "diagnosticText") {
			return generateDiagnosticText(params["diagnostics"] as any[])
		} else if (Object.prototype.hasOwnProperty.call(params, key)) {
			// Ensure the value is treated as a string for replacement
			const value = (params as any)[key]
			if (typeof value === "string") {
				return value
			} else if (Array.isArray(value)) {
				// Handle arrays by joining them with newlines or specified separator
				return value.join("\n")
			} else {
				// Convert non-string values to string for replacement
				return String(value)
			}
		} else {
			// If the placeholder key is not in params, replace with empty string
			return ""
		}
	})
}

// Advanced prompt creation with validation and enhancement
export const createAdvancedPrompt = (
	template: string, 
	params: PromptParams,
	options?: {
		validateInputs?: boolean;
		enhanceStructure?: boolean;
		addErrorHandling?: boolean;
	}
): string => {
	const opts = { validateInputs: true, enhanceStructure: true, addErrorHandling: true, ...options }
	
	// Input validation
	if (opts.validateInputs) {
		const requiredParams = template.match(/\$\{(.*?)\}/g)?.map(match => match.slice(2, -1)) || []
		const missingParams = requiredParams.filter(param => !(param in params) && param !== "diagnosticText")
		if (missingParams.length > 0) {
			console.warn(`Missing parameters for prompt: ${missingParams.join(", ")}`)
		}
	}
	
	let enhancedTemplate = template
	
	// Structure enhancement
	if (opts.enhanceStructure && !template.includes("<task_context>")) {
		enhancedTemplate = `<task_context>\n${enhancedTemplate}\n</task_context>`
	}
	
	// Error handling enhancement
	if (opts.addErrorHandling && !template.includes("If you're unsure")) {
		enhancedTemplate += `\n\n<error_handling>\nIf you're unsure about any aspect or need clarification, please ask specific questions rather than making assumptions.\n</error_handling>`
	}
	
	return createPrompt(enhancedTemplate, params)
}

interface SupportPromptConfig {
	template: string
}

export type SupportPromptType = "ENHANCE" | "ANALYZE" | "DEBUG" | "OPTIMIZE" | "DOCUMENT" | "TEST"

const supportPromptConfigs: Record<SupportPromptType, SupportPromptConfig> = {
	ENHANCE: {
		template: `You are an expert prompt engineer with deep knowledge of advanced prompting techniques including Chain-of-Thought, Tree of Thoughts, Meta Prompting, and Self-Consistency approaches.

Your task is to enhance the provided prompt using research-backed techniques from the latest prompt engineering studies.

<context>
Programming language: \${language}
Current prompt: \${userInput}
</context>

<enhancement_process>
Think step by step about how to improve this prompt:

1. **Analysis Phase**: Examine the current prompt for clarity, specificity, and structure
2. **Expert Perspectives**: Consider how 3 different prompt engineering experts would approach this
3. **Technique Application**: Apply relevant advanced techniques (CoT, ToT, few-shot, meta-prompting)
4. **Structure Optimization**: Ensure proper task context, examples, and output formatting
5. **Validation**: Check for potential edge cases and error handling
</enhancement_process>

<examples>
Example of good enhancement:
- Original: "Write code to sort a list"
- Enhanced: "You are an expert software engineer. Write efficient, well-documented code to sort a list.

<requirements>
- Language: Python
- Include error handling for edge cases
- Add type hints and docstrings
- Optimize for readability and performance
</requirements>

<examples>
def sort_list(items: List[int]) -> List[int]:
    \"\"\"Sort a list of integers in ascending order.\"\"\"
    if not items:
        return []
    return sorted(items)
</examples>

Think through your approach step by step, then provide the optimized code with explanations."
</examples>

<output_format>
Provide only the enhanced prompt - no meta-commentary, explanations, or surrounding quotes. The enhanced prompt should be immediately usable and significantly more effective than the original.
</output_format>`,
	},
	ANALYZE: {
		template: `You are a senior code reviewer and software architect with expertise in \${language} and software engineering best practices.

<task_context>
Perform a comprehensive analysis of the provided code, examining it from multiple expert perspectives:
- Code Quality Expert: Structure, readability, maintainability
- Security Specialist: Vulnerabilities and security best practices  
- Performance Engineer: Efficiency and optimization opportunities
- Architecture Reviewer: Design patterns and system design
</task_context>

<code_to_analyze>
\${userInput}
</code_to_analyze>

<analysis_framework>
1. **First Pass - Overview**: Understand the code's purpose and high-level structure
2. **Deep Dive Analysis**: Examine each expert perspective systematically
3. **Issue Identification**: Catalog problems by severity (Critical, High, Medium, Low)
4. **Improvement Recommendations**: Provide specific, actionable suggestions
5. **Best Practices Check**: Verify alignment with \${language} conventions
</analysis_framework>

<output_format>
<overview>
Brief description of what the code does
</overview>

<findings>
**Critical Issues:**
- [List any critical problems]

**Improvements:**
- [Specific recommendations with code examples]

**Best Practices:**
- [Alignment with language conventions]
</findings>

<recommendations>
Priority-ordered list of actionable improvements
</recommendations>
</output_format>`,
	},
	DEBUG: {
		template: `You are an expert debugging specialist with deep knowledge of \${language} and systematic problem-solving approaches.

<debugging_context>
Language: \${language}
Issue/Error: \${userInput}
</debugging_context>

<debugging_methodology>
Let's approach this systematically using proven debugging techniques:

1. **Problem Understanding**: Clearly define what's wrong vs expected behavior
2. **Hypothesis Generation**: Consider multiple potential root causes
3. **Evidence Gathering**: What information do we have/need?
4. **Systematic Testing**: Step-by-step isolation of the issue
5. **Root Cause Analysis**: Identify the fundamental cause
6. **Solution Implementation**: Provide specific fixes
7. **Prevention Strategy**: How to avoid similar issues
</debugging_methodology>

<expert_perspectives>
Consider insights from:
- **Syntax Expert**: Language-specific gotchas and common mistakes
- **Logic Analyst**: Algorithm and flow issues  
- **Environment Specialist**: Runtime, dependencies, configuration problems
- **Performance Debugger**: Memory, efficiency, and resource issues
</expert_perspectives>

<output_format>
<problem_analysis>
Clear description of the issue and its symptoms
</problem_analysis>

<root_cause>
The fundamental reason this problem occurs
</root_cause>

<solution>
\`\`\`\${language}
// Fixed code with explanatory comments
\`\`\`
</solution>

<explanation>
Step-by-step explanation of the fix and why it works
</explanation>

<prevention>
How to avoid this type of issue in the future
</prevention>
</output_format>`,
	},
	OPTIMIZE: {
		template: `You are a performance optimization expert specializing in \${language} with deep knowledge of algorithmic efficiency, memory management, and system performance.

<optimization_context>
Target Language: \${language}
Code/System to optimize: \${userInput}
</optimization_context>

<optimization_strategy>
Apply systematic optimization approach:

1. **Performance Profiling**: Identify current bottlenecks and inefficiencies
2. **Algorithmic Analysis**: Examine time/space complexity (Big O analysis)
3. **Multiple Optimization Vectors**: 
   - Algorithm efficiency (better data structures, algorithms)
   - Memory optimization (reduced allocations, better data layout)
   - I/O optimization (caching, batching, async operations)
   - Concurrency opportunities (parallelization, async processing)
4. **Trade-off Analysis**: Performance vs readability vs maintainability
5. **Benchmarking Strategy**: How to measure improvements
</optimization_strategy>

<expert_consultation>
Get insights from specialized experts:
- **Algorithm Specialist**: Better algorithmic approaches
- **Memory Expert**: Memory usage patterns and optimization
- **Concurrency Engineer**: Parallel processing opportunities
- **System Architect**: Overall design optimization
</expert_consultation>

<output_format>
<current_analysis>
Performance characteristics of the current implementation
- Time Complexity: O(?)
- Space Complexity: O(?)
- Key bottlenecks identified
</current_analysis>

<optimization_recommendations>
**High Impact Optimizations:**
1. [Most important optimization with code example]
2. [Second most important...]

**Implementation:**
\`\`\`\${language}
// Optimized code with performance annotations
\`\`\`
</optimization_recommendations>

<performance_impact>
Expected performance improvements and trade-offs
</performance_impact>

<benchmarking>
How to measure and validate the optimizations
</benchmarking>
</output_format>`,
	},
	DOCUMENT: {
		template: `You are a technical documentation expert specializing in \${language}. Generate a clear, complete Markdown document for the following code/system or description.

Context:
- Language/Stack: \${language}
- Subject to document:
\n\n\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t
\${userInput}

Requirements:
 - Output final documentation in Markdown only (no XML/HTML-esque wrapper tags, no commentary about what you will do).
- Make it self-contained and skimmable with headings, lists, and code blocks.
- Include, where applicable:
	1. Title and short overview
	2. Installation/setup or prerequisites
  3. Usage with examples (fenced code blocks for \${language} when relevant)
	4. API/parameters and return types
	5. Configuration and environment variables
	6. Implementation notes and design decisions
	7. Common pitfalls and troubleshooting
	8. Testing and maintenance guidance
	9. Versioning/compatibility notes
- Keep examples realistic. Prefer concise code illustrating typical and edge cases.
- If parts are unknown from the context, omit them rather than inventing details.

Deliverable:
Return only the finished Markdown document, ready to paste into a README or docs site.`,
	},
	TEST: {
		template: `You are a testing expert with deep knowledge of \${language} testing frameworks, methodologies, and best practices including unit testing, integration testing, and test-driven development.

<testing_context>
Language: \${language}
Code/Functionality to test: \${userInput}
</testing_context>

<testing_strategy>
Develop comprehensive testing approach:

1. **Test Planning**: Identify what needs to be tested and test categories
2. **Test Design**: Create test cases covering:
   - Happy path scenarios (normal operation)
   - Edge cases and boundary conditions
   - Error conditions and exception handling
   - Performance and stress scenarios
3. **Test Implementation**: Write maintainable, readable tests
4. **Test Organization**: Structure tests logically with clear naming
5. **Coverage Analysis**: Ensure adequate code coverage
</testing_strategy>

<testing_expert_consultation>
- **Unit Test Specialist**: Individual component testing
- **Integration Expert**: System interaction testing  
- **QA Engineer**: User scenario and acceptance testing
- **Performance Tester**: Load and stress testing
</testing_expert_consultation>

<output_format>
<test_plan>
## Test Strategy

**Test Categories:**
- Unit Tests: [Component-level testing]
- Integration Tests: [System interaction testing]
- Edge Cases: [Boundary and error conditions]
</test_plan>

<test_implementation>
### Unit Tests

\`\`\`\${language}
// Comprehensive test suite with clear test names
// Test happy path, edge cases, and error conditions
\`\`\`

### Integration Tests

\`\`\`\${language}
// Tests for component interactions and system behavior
\`\`\`

### Test Data and Mocks

\`\`\`\${language}
// Test data setup and mock configurations
\`\`\`
</test_implementation>

<test_cases>
### Test Case Coverage

**Happy Path:**
- [Normal operation scenarios]

**Edge Cases:**
- [Boundary conditions and special inputs]

**Error Handling:**
- [Exception scenarios and error recovery]
</test_cases>

<testing_guidelines>
### Best Practices
- Test naming conventions
- Test data management
- Assertion strategies
- Maintenance considerations
</testing_guidelines>
</output_format>`,
	},
} as const

export const supportPrompt = {
	default: Object.fromEntries(Object.entries(supportPromptConfigs).map(([key, config]) => [key, config.template])) as Record<SupportPromptType, string>,
	get: (customSupportPrompts: Record<string, any> | undefined, type: SupportPromptType): string => {
		return (customSupportPrompts as any)?.[type] ?? supportPromptConfigs[type].template
	},
	create: (type: SupportPromptType, params: PromptParams, customSupportPrompts?: Record<string, any>): string => {
		const template = supportPrompt.get(customSupportPrompts, type)
		return createPrompt(template, params)
	},
	// Helper method to get all available prompt types
	getAvailableTypes: (): SupportPromptType[] => {
		return Object.keys(supportPromptConfigs) as SupportPromptType[]
	},
	// Helper method to get prompt description
	getDescription: (type: SupportPromptType): string => {
		const descriptions: Record<SupportPromptType, string> = {
			ENHANCE: "Improve and optimize prompts using advanced prompt engineering techniques",
			ANALYZE: "Comprehensive code analysis from multiple expert perspectives", 
			DEBUG: "Systematic debugging with root cause analysis and solutions",
			OPTIMIZE: "Performance optimization focusing on algorithms and efficiency",
			DOCUMENT: "Generate comprehensive technical documentation",
			TEST: "Create thorough test suites with multiple testing strategies"
		}
		return descriptions[type]
	},
} as const
