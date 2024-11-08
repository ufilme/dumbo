import { NextResponse } from 'next/server'

export async function GET() {
    const res = await fetch(`${process.env.DUMBO_API}/api/hosts`, {
        headers: {
          'Content-Type': 'application/json',
        },
    })
    const data = await res.json()
    
    return NextResponse.json(data)
}