import { supabase } from './supabaseClient'

export const ADMIN_UID = import.meta.env.VITE_ADMIN_UID

export async function signInAdmin(email, password) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw error
  }

  return data.session
}

export async function signOutAdmin() {
  if (!supabase) return
  await supabase.auth.signOut()
}
