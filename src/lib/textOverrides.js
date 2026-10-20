import { fetchSetting, saveSetting } from './settings'

export const TEXT_OVERRIDES_KEY = 'text_overrides'

// Shape: { 'nav.video': { zh: '影像', ko: '', en: '' }, ... } — empty/missing means "use the built-in text".
export async function fetchTextOverrides() {
  const value = await fetchSetting(TEXT_OVERRIDES_KEY)
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export function saveTextOverrides(overrides) {
  return saveSetting(TEXT_OVERRIDES_KEY, overrides)
}
