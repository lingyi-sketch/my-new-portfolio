import { supabase } from './supabaseClient'
import { deleteMediaFile } from './storage'
import { edgeSortOrder } from './ordering'

const PROFILE_COLUMNS = 'id, name, subtitle, intro, bio, aphorism, contacts, translations'
const PHOTO_COLUMNS = 'id, image_url, created_at, sort_order'

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }
}

export async function fetchProfile() {
  requireClient()

  const { data, error } = await supabase
    .from('site_profile')
    .select(PROFILE_COLUMNS)
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function fetchProfilePhotos() {
  requireClient()

  const { data, error } = await supabase
    .from('site_profile_photos')
    .select(PHOTO_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function saveProfile({ name, subtitle, intro, bio, aphorism, contacts, translations }) {
  requireClient()

  const { data, error } = await supabase
    .from('site_profile')
    .upsert({
      id: 1,
      name,
      subtitle,
      intro,
      bio,
      aphorism,
      contacts,
      translations,
      updated_at: new Date().toISOString(),
    })
    .select(PROFILE_COLUMNS)
    .single()

  if (error) throw error
  return data
}

export async function addProfilePhoto(imageUrl) {
  requireClient()

  const sort_order = await edgeSortOrder('site_profile_photos', { lowest: false })

  const { data, error } = await supabase
    .from('site_profile_photos')
    .insert({ image_url: imageUrl, sort_order })
    .select(PHOTO_COLUMNS)
    .single()

  if (error) throw error
  return data
}

export async function deleteProfilePhoto(photo) {
  requireClient()

  await deleteMediaFile(photo.image_url)

  const { error } = await supabase.from('site_profile_photos').delete().eq('id', photo.id)
  if (error) throw error
}
