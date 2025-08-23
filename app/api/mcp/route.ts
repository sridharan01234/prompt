import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tool, params } = body

    // Map tool calls to their respective functions
    switch (tool) {
      case 'mcp_firecrawl_firecrawl_search':
        return await handleFirecrawlSearch(params)
      case 'mcp_firecrawl_firecrawl_scrape':
        return await handleFirecrawlScrape(params)
      default:
        return NextResponse.json({ error: 'Unknown tool' }, { status: 400 })
    }
  } catch (error) {
    console.error('MCP API error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

async function handleFirecrawlSearch(params: any) {https://www.promptingguide.ai/techniques
  try {
    const { query, limit = 5, scrapeOptions = {} } = params
    
    // Mock implementation - replace with actual Firecrawl API call
    // For now, return relevant content for Upwork proposals
    const mockResults = [
      {
        url: 'https://www.upwork.com/resources/how-to-create-a-proposal-that-wins-jobs',
        title: 'How To Create a Proposal That Wins Jobs',
        content: `Key strategies for winning Upwork proposals:

1. **Start with Problem Understanding**: Show you've read their job description thoroughly
2. **Establish Credibility**: Highlight relevant experience and achievements with metrics
3. **Solution Preview**: Briefly outline your approach to their specific challenge
4. **Value Proposition**: Explain unique benefits of working with you
5. **Professional Closing**: Clear next steps and call-to-action

Best Practices:
- Keep proposals concise (3-4 paragraphs max)
- Use client's terminology and language
- Include relevant work samples
- Ask intelligent questions that show expertise
- Demonstrate understanding of their business context
- Address potential concerns proactively`
      },
      {
        url: 'https://support.upwork.com/hc/en-us/articles/35080636066835-The-anatomy-of-a-winning-proposal',
        title: 'The anatomy of a winning proposal',
        content: `Essential components of effective Upwork proposals:

**Structure That Works:**
1. Personalized greeting with client's name when possible
2. Immediate demonstration of project understanding
3. Relevant skills showcase with specific examples
4. Clear value proposition and unique approach
5. Compelling call to action

**Key Techniques:**
- Focus on client benefits, not just your services
- Use keywords from job description for searchability
- Quantify achievements with numbers and data
- Proofread carefully for professionalism
- Tailor each proposal to specific project needs
- Show enthusiasm for the specific opportunity`
      },
      {
        url: 'https://medium.com/@mikealbertdotco/how-to-write-a-proposal-on-upwork-that-actually-gets-you-hired-93f0434bebf9',
        title: 'How to Write a Proposal on Upwork that Actually Gets you Hired',
        content: `Proven proposal structure that gets results:

**Winning Formula:**
1. **Restate their core problem** - Use their exact words
2. **Offer immediate help** - "I can help you with that, and can start right away"
3. **Establish fit** - 2-3 sentences on why you're perfect for this
4. **Describe your process** - Walk them through your approach
5. **Include attachments** - Professional samples or process documents

**Common Mistakes to Avoid:**
- Generic copy-paste templates
- Focusing on "me, me, me" instead of their problems
- Overwhelming clients with your entire resume
- Not showing understanding of their specific needs
- Failing to differentiate from other freelancers`
      }
    ]

    if (query.includes('prompt engineering')) {
      return NextResponse.json({
        results: [
          {
            url: 'https://www.promptingguide.ai/techniques',
            title: 'Prompt Engineering Techniques',
            content: `Advanced prompting techniques for better AI results:

**Core Techniques:**
1. **Zero-shot Prompting**: Direct instruction without examples
2. **Few-shot Prompting**: Provide examples to guide behavior
3. **Chain-of-Thought**: Step-by-step reasoning process
4. **Self-Consistency**: Multiple reasoning paths for reliability
5. **Tree of Thoughts**: Explore multiple reasoning branches

**Best Practices:**
- Be specific and clear in instructions
- Use role-based prompting (act as expert...)
- Structure with clear sections and formatting
- Include constraints and requirements
- Ask for step-by-step explanations
- Use examples when possible
- Test and iterate for better results`
          }
        ]
      })
    }

    return NextResponse.json({ results: mockResults.slice(0, limit) })
  } catch (error) {
    console.error('Firecrawl search error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

async function handleFirecrawlScrape(params: any) {
  try {
    const { url, formats = ['markdown'] } = params
    
    // Mock implementation - return relevant content based on URL
    if (url.includes('promptingguide.ai')) {
      return NextResponse.json({
        markdown: `# Prompt Engineering Techniques

Advanced techniques for better AI interactions:

## Chain-of-Thought Prompting
Break down complex problems into step-by-step reasoning.

## Few-Shot Learning
Provide examples to guide AI behavior and output format.

## Role-Based Prompting
Define specific expert roles for specialized knowledge.

## Structured Output
Use clear formatting and organization for better results.`
      })
    }

    return NextResponse.json({
      markdown: 'Content scraped successfully',
      url: url
    })
  } catch (error) {
    console.error('Firecrawl scrape error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
