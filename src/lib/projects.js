import { supabase } from './supabaseClient'
import { deleteMediaFile } from './storage'

const COLUMNS = 'id, category, title, description, image_url, video_url, created_at'

export async function fetchProjects(category) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  let query = supabase.from('projects').select(COLUMNS).order('created_at', { ascending: false })
  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createProject({ category, title, description, image_url, video_url }) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({ category, title, description, image_url, video_url })
    .select(COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateProject(id, { category, title, description, image_url, video_url }) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ category, title, description, image_url, video_url })
    .eq('id', id)
    .select(COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteProject(project) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  await Promise.all([deleteMediaFile(project.image_url), deleteMediaFile(project.video_url)])

  const { error } = await supabase.from('projects').delete().eq('id', project.id)

  if (error) {
    throw error
  }
}
