import { NextResponse } from 'next/server'

export async function GET() {
    const res = await fetch(`${process.env.DUMBO_API}`, {
        headers: {
          'Content-Type': 'application/json',
        },
    })
    // const data = await res.json()
    
    return NextResponse.json({"status": res.status})
}