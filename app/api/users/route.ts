import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/supabaseServer'

export async function GET() {
  const supabase = getSupabaseServer()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 }
    )
  }
  const { data, error } = await supabase.from('users').select('*')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}