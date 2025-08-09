'use client'

import { useState, useCallback, useRef } from 'react'

export interface StreamingResponse {
  type: 'metadata' | 'content' | 'complete' | 'error'
  content?: string
  error?: string
  prompt?: string
  model?: string
  promptType?: string
}

export interface UseStreamingApiOptions {
  onContent?: (content: string) => void
  onComplete?: (fullContent: string) => void
  onError?: (error: string) => void
  onMetadata?: (metadata: any) => void
}

export function useStreamingApi(options: UseStreamingApiOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Initiates a streaming request to the API
   * @param url - The API endpoint URL
   * @param requestBody - The request payload
   * @param useStreaming - Whether to use streaming or fallback to regular request
   */
  const startStreaming = useCallback(async (
    url: string, 
    requestBody: any, 
    useStreaming: boolean = true
  ) => {
    // Reset state for new request
    setIsStreaming(true)
    setStreamedContent('')
    setError(null)

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      if (!useStreaming) {
        // Fallback to regular fetch for non-streaming requests
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Request failed')
        }

        const data = await response.json()
        setStreamedContent(data.output || '')
        options.onComplete?.(data.output || '')
        return
      }

      // Streaming request using Server-Sent Events format
      const response = await fetch(url + '?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/stream'
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        // Try to parse error from response
        const errorText = await response.text()
        let errorMessage = 'Request failed'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Check if response is actually streaming
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('text/stream')) {
        // Fallback to regular JSON response
        const data = await response.json()
        setStreamedContent(data.output || '')
        options.onComplete?.(data.output || '')
        return
      }

      // Process streaming response
      await processStreamingResponse(response)

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request was aborted')
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      options.onError?.(errorMessage)
    } finally {
      setIsStreaming(false)
    }
  }, [options])

  /**
   * Processes the streaming response using ReadableStream
   * @param response - The fetch response object
   */
  const processStreamingResponse = async (response: Response) => {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let accumulatedContent = ''

    if (!reader) {
      throw new Error('Unable to read response stream')
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete lines from buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue

          // Parse Server-Sent Events format
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6) // Remove 'data: ' prefix
              const data: StreamingResponse = JSON.parse(jsonStr)

              switch (data.type) {
                case 'metadata':
                  options.onMetadata?.(data)
                  break

                case 'content':
                  if (data.content) {
                    accumulatedContent += data.content
                    setStreamedContent(accumulatedContent)
                    options.onContent?.(data.content)
                  }
                  break

                case 'complete':
                  options.onComplete?.(accumulatedContent)
                  return

                case 'error':
                  throw new Error(data.error || 'Streaming error occurred')

                default:
                  console.warn('Unknown stream data type:', data.type)
              }
            } catch (parseError) {
              console.error('Failed to parse streaming data:', parseError)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Cancels the current streaming request
   */
  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStreaming(false)
  }, [])

  /**
   * Resets the streaming state
   */
  const resetStream = useCallback(() => {
    setStreamedContent('')
    setError(null)
    setIsStreaming(false)
  }, [])

  return {
    isStreaming,
    streamedContent,
    error,
    startStreaming,
    cancelStreaming,
    resetStream
  }
}
