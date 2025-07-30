import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { clientId, userId } = await request.json()

    if (!clientId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_client_pins')
      .insert({ user_id: userId, client_id: clientId })

    if (error) {
      console.error('Error pinning client:', error)
      return NextResponse.json({ error: 'Failed to pin client' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in pin POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { clientId, userId } = await request.json()

    if (!clientId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_client_pins')
      .delete()
      .eq('user_id', userId)
      .eq('client_id', clientId)

    if (error) {
      console.error('Error unpinning client:', error)
      return NextResponse.json({ error: 'Failed to unpin client' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in pin DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}