# Prompt Enhancement Application

A comprehensive TypeScript library and CLI tool for creating, managing, and enhancing AI prompts with support for templates, parameter validation, and batch processing.

## Features

- 🎯 **Pre-built Prompt Templates**: Support for code explanation, fixing, improvement, terminal commands, and more
- 🔧 **Custom Template Management**: Create, store, and organize your own prompt templates
- ✅ **Parameter Validation**: Ensure required parameters are provided before prompt generation
- 📦 **Batch Processing**: Generate multiple prompts efficiently
- 💻 **CLI Interface**: Interactive command-line tool for prompt management
- 🔄 **Template Variables**: Dynamic parameter substitution with validation
- 📚 **Template Library**: Import/export template collections
- 🎨 **Enhanced Prompts**: Built-in prompt enhancement capabilities

## Installation

```bash
npm install
npm run build
```

## Quick Start

### Using the Library

```typescript
import { PromptEngine, SupportPromptType } from './src'

// Initialize the prompt engine
const engine = new PromptEngine()

// Create a basic prompt
const result = engine.createPrompt('ENHANCE', {
	userInput: 'Write a function to sort an array'
})

console.log(result.prompt) // Enhanced version of the input
```

### Using the CLI

```bash
# Interactive mode
npm run dev cli interactive

# Generate a specific prompt
npm run dev cli generate --type ENHANCE --params '{"userInput":"Create a REST API"}'

# List available templates
npm run dev cli list

# Add a custom template
npm run dev cli template add --id my-template --name "My Template" --template "Custom: \${input}" --description "My custom template"
```

## Available Prompt Types

### Code-Related Prompts

- **EXPLAIN**: Explains code with context and technical details
- **FIX**: Identifies and fixes issues in code with diagnostic information
- **IMPROVE**: Suggests improvements for code quality and performance
- **ADD_TO_CONTEXT**: Adds code context to conversations

### Terminal-Related Prompts

- **TERMINAL_GENERATE**: Generates terminal commands from natural language
- **TERMINAL_EXPLAIN**: Explains terminal commands and their functionality
- **TERMINAL_FIX**: Fixes issues in terminal commands
- **TERMINAL_ADD_TO_CONTEXT**: Adds terminal output to conversation context

### General Purpose Prompts

- **ENHANCE**: Improves the clarity and effectiveness of any prompt
- **CONDENSE**: Creates detailed summaries of conversations
- **NEW_TASK**: Creates new task prompts
- **COMMIT_MESSAGE**: Generates conventional commit messages from git diffs

## Library Usage Examples

### Basic Prompt Creation

```typescript
import { PromptEngine } from './src'

const engine = new PromptEngine()

// Enhance a prompt
const enhanced = engine.createPrompt('ENHANCE', {
	userInput: 'Create a login system'
})

// Explain code
const explanation = engine.createPrompt('EXPLAIN', {
	filePath: 'src/auth.ts',
	startLine: '10',
	endLine: '25',
	selectedText: 'function authenticate(user, password) { ... }',
	userInput: 'How does this authentication work?'
})
```

### Custom Prompts

```typescript
// Add custom prompt templates
const customEngine = new PromptEngine({
	CUSTOM_DEBUG: 'Debug this issue: \${issue}\\nEnvironment: \${environment}'
})

const result = customEngine.createPrompt('CUSTOM_DEBUG', {
	issue: 'Function returns null',
	environment: 'Node.js 18.0.0'
})
```

### Template Management

```typescript
import { PromptTemplateManager, createDefaultTemplates } from './src'

const manager = new PromptTemplateManager()

// Load default templates
createDefaultTemplates().forEach(template => {
	manager.addTemplate(template)
})

// Create custom template
manager.createTemplate(
	'api-docs',
	'API Documentation',
	'Generate API documentation for: \${endpoint}\\nMethod: \${method}',
	'Creates API documentation',
	'Documentation',
	['api', 'docs']
)

// Search templates
const codeTemplates = manager.searchTemplates('code')
```

### Batch Processing

```typescript
const requests = [
	{ type: 'NEW_TASK', params: { userInput: 'Create user registration' } },
	{ type: 'NEW_TASK', params: { userInput: 'Implement email verification' } },
	{ type: 'NEW_TASK', params: { userInput: 'Add password reset' } }
]

const results = engine.createMultiplePrompts(requests)
results.forEach((result, index) => {
	console.log(`Task ${index + 1}: ${result.prompt}`)
})
```

## CLI Commands

### Interactive Mode

```bash
npm run dev cli interactive
```

Features:
- ✨ Create prompts with guided parameter input
- 📚 Browse available templates
- 🔧 Manage custom templates
- 🎯 Enhance existing prompts
- 💾 Save prompts to files

### Command-Line Usage

```bash
# Generate prompts
npm run dev cli generate -t ENHANCE -p '{"userInput":"Fix this code"}'
npm run dev cli generate --type EXPLAIN --file params.json
npm run dev cli generate -t FIX -o output.md

# List and search templates
npm run dev cli list
npm run dev cli list --category Development
npm run dev cli list --search "code review"

# Template management
npm run dev cli template add -i custom-prompt -n "Custom Prompt" -t "Template: \${input}" -d "My template"
```

## Parameter Validation

The system supports automatic parameter validation:

```typescript
// Enable validation
const result = engine.createPrompt('EXPLAIN', {
	filePath: 'test.ts'
	// Missing required parameters: startLine, endLine, selectedText
}, { enableValidation: true })
// Throws: Error: Missing required parameters: startLine, endLine, selectedText
```

## Template Variables

Templates support dynamic parameter substitution:

```typescript
// Template: "Hello \${name}, you have \${count} messages"
const result = createPrompt(template, { name: 'Alice', count: '5' })
// Output: "Hello Alice, you have 5 messages"

// Extract variables from templates
const variables = extractTemplateVariables(template)
// Returns: ['name', 'count']
```

## Import/Export Templates

```typescript
// Export templates
const library = manager.exportLibrary()
await fs.writeJson('my-templates.json', library)

// Import templates
const imported = await fs.readJson('my-templates.json')
manager.loadLibrary(imported)
```

## Configuration

### TypeScript Configuration

The project uses TypeScript with strict type checking. See `tsconfig.json` for configuration details.

### Jest Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Development

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## API Reference

### PromptEngine

Main class for prompt generation and management.

```typescript
class PromptEngine {
	constructor(customPrompts?: CustomSupportPrompts)
	createPrompt(type: SupportPromptType, params: PromptParams, options?: PromptEnhancementOptions): PromptGenerationResult
	getTemplate(type: SupportPromptType): string
	getTemplateVariables(type: SupportPromptType): string[]
	createMultiplePrompts(requests: Array<{type: SupportPromptType, params: PromptParams}>): PromptGenerationResult[]
	setCustomPrompt(type: string, template: string): void
	removeCustomPrompt(type: string): void
}
```

### PromptTemplateManager

Manages custom template collections.

```typescript
class PromptTemplateManager {
	addTemplate(template: PromptTemplate): void
	getTemplate(id: string): PromptTemplate | undefined
	searchTemplates(query: string): PromptTemplate[]
	getTemplatesByCategory(category: string): PromptTemplate[]
	exportLibrary(): PromptLibrary
	loadLibrary(library: PromptLibrary): void
}
```

### Utility Functions

```typescript
// Create prompts with parameter substitution
createPrompt(template: string, params: PromptParams): string

// Validate required parameters
validatePromptParams(requiredParams: string[], params: PromptParams): {valid: boolean, missing: string[]}

// Extract template variables
extractTemplateVariables(template: string): string[]

// Validate template syntax
validateTemplate(template: string): {valid: boolean, errors: string[]}
```

## Examples

See `src/examples.ts` for comprehensive usage examples covering:

- Basic prompt enhancement
- Code explanation and fixing
- Terminal command generation
- Custom template creation
- Batch processing
- Template management
- Parameter validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details
