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

export async function createProject({ title, description, image_url, video_url }) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({ title, description, image_url, video_url })
    .select('id, title, description, image_url, video_url, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateProject(id, { title, description, image_url, video_url }) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ title, description, image_url, video_url })
    .eq('id', id)
    .select('id, title, description, image_url, video_url, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteProject(id) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    throw error
  }
}
