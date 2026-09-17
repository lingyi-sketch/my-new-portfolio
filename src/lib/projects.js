import { supabase } from './supabaseClient'

export async function fetchProjects() {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, title, description, image_url, video_url, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}
