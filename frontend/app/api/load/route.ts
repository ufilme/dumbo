import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const res = await fetch(`${process.env.DUMBO_API}/api/load?${queryString}`, {
        headers: {
          'Content-Type': 'application/json',
        },
    })
    const data = await res.json()
    
    return NextResponse.json(data)
}