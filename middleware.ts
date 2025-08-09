import { NextResponse } from 'next/server'

export function middleware() {
  // No-op middleware; does not run for any route (matcher excludes all)
  return NextResponse.next()
}

export const config = {
  matcher: ['/does-not-match']
}
