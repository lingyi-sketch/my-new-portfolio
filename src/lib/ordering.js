import { supabase } from './supabaseClient'

export async function saveOrder(table, ids) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const results = await Promise.all(
    ids.map((id, index) => supabase.from(table).update({ sort_order: index }).eq('id', id)),
  )

  const failed = results.find((result) => result.error)
  if (failed) throw failed.error
}

export async function edgeSortOrder(table, { lowest }) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }

  const { data, error } = await supabase
    .from(table)
    .select('sort_order')
    .order('sort_order', { ascending: lowest })
    .limit(1)

  if (error) throw error

  const edge = data?.[0]?.sort_order ?? 0
  return lowest ? edge - 1 : edge + 1
}
