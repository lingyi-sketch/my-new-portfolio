import { supabase } from './supabaseClient'
import { deleteMediaFile } from './storage'
import { edgeSortOrder } from './ordering'

const COLUMNS =
  'id, week, kind, title, description, content, image_url, file_url, link_url, created_at, sort_order'

export const ASSIGNMENT_KINDS = [
  { key: 'prompt', label: '프롬프트', formLabel: '프롬프트 (md 파일)' },
  { key: 'game', label: '게임', formLabel: '게임 (영상 URL)' },
  { key: 'image', label: '이미지', formLabel: '이미지' },
  { key: 'video', label: '영상', formLabel: '영상 (파일 또는 URL)' },
  { key: 'document', label: '문서', formLabel: '문서 (PDF · Word)' },
]

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }
}

export async function fetchAssignments() {
  requireClient()

  const { data, error } = await supabase
    .from('site_assignments')
    .select(COLUMNS)
    .order('week', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createAssignment(values) {
  requireClient()

  const sort_order = await edgeSortOrder('site_assignments', { lowest: false })

  const { data, error } = await supabase
    .from('site_assignments')
    .insert({ ...values, sort_order })
    .select(COLUMNS)
    .single()

  if (error) throw error
  return data
}

export async function updateAssignment(id, values) {
  requireClient()

  const { data, error } = await supabase
    .from('site_assignments')
    .update(values)
    .eq('id', id)
    .select(COLUMNS)
    .single()

  if (error) throw error
  return data
}

export async function deleteAssignment(assignment) {
  requireClient()

  await Promise.all([deleteMediaFile(assignment.image_url), deleteMediaFile(assignment.file_url)])

  const { error } = await supabase.from('site_assignments').delete().eq('id', assignment.id)
  if (error) throw error
}
