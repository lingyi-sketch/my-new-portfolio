import { supabase } from './supabaseClient'
import { deleteMediaFile } from './storage'
import { edgeSortOrder } from './ordering'
import { orderWeeks } from './weekOrder'

const COLUMNS =
  'id, week, title, description, course, entry_date, body, prompts, files, result_url, cover_url, created_at, sort_order'

// Rows created before the "entry" format keep their old kind/content columns untouched;
// the migration copies them into the new columns, and `kind` only has to satisfy NOT NULL.
const ENTRY_KIND = 'entry'

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }
}

function normalize(row) {
  return {
    ...row,
    prompts: Array.isArray(row.prompts) ? row.prompts : [],
    files: Array.isArray(row.files) ? row.files : [],
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
  return (data ?? []).map(normalize)
}

export async function createAssignment(values) {
  requireClient()

  const sort_order = await edgeSortOrder('site_assignments', { lowest: false })

  const { data, error } = await supabase
    .from('site_assignments')
    .insert({ ...values, kind: ENTRY_KIND, sort_order })
    .select(COLUMNS)
    .single()

  if (error) throw error
  return normalize(data)
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
  return normalize(data)
}

export function storedUrls(assignment) {
  return [assignment.cover_url, ...(assignment.files ?? []).map((file) => file.url)].filter(Boolean)
}

export async function deleteAssignment(assignment) {
  requireClient()

  await Promise.all(storedUrls(assignment).map((url) => deleteMediaFile(url)))

  const { error } = await supabase.from('site_assignments').delete().eq('id', assignment.id)
  if (error) throw error
}

export function groupByWeek(assignments) {
  const weeks = new Map()
  for (const assignment of assignments) {
    if (!weeks.has(assignment.week)) weeks.set(assignment.week, [])
    weeks.get(assignment.week).push(assignment)
  }
  return weeks
}

// Same order the list page shows: weeks in the saved order, items by sort_order inside a week.
export function inDisplayOrder(assignments, weekOrder) {
  const groups = groupByWeek(assignments)
  return orderWeeks([...groups.keys()], weekOrder).flatMap((week) => groups.get(week))
}

export function formatEntryDate(assignment) {
  const raw = assignment.entry_date ?? assignment.created_at
  if (!raw) return ''
  const [year, month, day] = String(raw).slice(0, 10).split('-')
  return year && month && day ? `${year}. ${month}. ${day}.` : ''
}
