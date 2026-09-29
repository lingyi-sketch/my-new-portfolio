import { supabase } from './supabaseClient'
import { deleteMediaFile } from './storage'

const COLUMNS = 'id, title, synopsis, video_url, video_description, link_url, created_at'

export async function fetchGames() {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const { data, error } = await supabase
    .from('games')
    .select(COLUMNS)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createGame({ title, synopsis, video_url, video_description, link_url }) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const { data, error } = await supabase
    .from('games')
    .insert({ title, synopsis, video_url, video_description, link_url })
    .select(COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateGame(id, { title, synopsis, video_url, video_description, link_url }) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const { data, error } = await supabase
    .from('games')
    .update({ title, synopsis, video_url, video_description, link_url })
    .eq('id', id)
    .select(COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteGame(game) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  await deleteMediaFile(game.video_url)

  const { error } = await supabase.from('games').delete().eq('id', game.id)

  if (error) {
    throw error
  }
}
