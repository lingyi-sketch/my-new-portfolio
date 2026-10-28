import { parseHttpUrl } from './FilePreview'
import { isLocalGame } from './GameFrame'
import { useLanguage } from '../i18n/LanguageContext'

const newFileRow = (file = {}) => ({ key: crypto.randomUUID(), label: file.label ?? '', url: file.url ?? '' })

function sideState(side) {
  return {
    label: side?.label ?? '',
    body: side?.body ?? '',
    game_url: side?.game_url ?? '',
    imagesText: (side?.images ?? []).join('\n'),
    imageFiles: [],
    files: (side?.files ?? []).map(newFileRow),
  }
}

export function initialCompare(compare) {
  return { enabled: Boolean(compare), left: sideState(compare?.left), right: sideState(compare?.right) }
}

const isOkUrl = (url) => Boolean(parseHttpUrl(url)) || isLocalGame(url) || /^\/[\w\-./]+$/.test(url)

// Every URL typed into the comparison must be an http(s) address or a path on this site.
export function compareUrls(state) {
  if (!state.enabled) return []
  return ['left', 'right'].flatMap((name) => {
    const side = state[name]
    const lines = side.imagesText.split('\n').map((line) => line.trim()).filter(Boolean)
    return [side.game_url.trim(), ...lines, ...side.files.map((row) => row.url.trim())].filter(Boolean)
  })
}

export function hasBadCompareUrl(state) {
  return compareUrls(state).some((url) => !isOkUrl(url))
}

// Turns the form state into the stored shape; uploaded image URLs are reported through `onUploaded` for clean-up on failure.
export async function buildCompare(state, uploadImage, onUploaded) {
  if (!state.enabled) return null
  const result = {}
  for (const name of ['left', 'right']) {
    const side = state[name]
    const images = side.imagesText.split('\n').map((line) => line.trim()).filter(Boolean)
    for (const file of side.imageFiles) {
      const url = await uploadImage(file)
      onUploaded(url)
      images.push(url)
    }
    result[name] = {
      label: side.label.trim(),
      body: side.body,
      game_url: side.game_url.trim(),
      images,
      files: side.files
        .filter((row) => row.url.trim())
        .map((row) => ({ label: row.label.trim() || row.url.trim(), url: row.url.trim() })),
    }
  }
  return result
}

function SideEditor({ title, side, onChange }) {
  const { t } = useLanguage()
  const patch = (values) => onChange({ ...side, ...values })

  return (
    <fieldset className="admin-assignment-row">
      <div className="admin-assignment-row__head">
        <span className="admin-assignment-row__title">{title}</span>
      </div>

      <label className="admin-form__field">
        <span>{t('admin.compare.label')}</span>
        <input type="text" value={side.label} onChange={(e) => patch({ label: e.target.value })} />
      </label>

      <label className="admin-form__field">
        <span>{t('admin.compare.body')}</span>
        <textarea rows={8} value={side.body} onChange={(e) => patch({ body: e.target.value })} />
      </label>

      <label className="admin-form__field">
        <span>{t('admin.compare.game')}</span>
        <input type="text" placeholder="/games/week3-A.html" value={side.game_url} onChange={(e) => patch({ game_url: e.target.value })} />
      </label>

      <label className="admin-form__field">
        <span>{t('admin.compare.images')}</span>
        <textarea rows={3} value={side.imagesText} onChange={(e) => patch({ imagesText: e.target.value })} />
      </label>

      <label className="admin-form__field">
        <span>{t('admin.compare.upload')}</span>
        <input type="file" accept="image/*" multiple onChange={(e) => patch({ imageFiles: Array.from(e.target.files ?? []) })} />
      </label>

      <div className="admin-assignment-row__sub">
        <span className="admin-hint">{t('admin.compare.files')}</span>
        {side.files.map((row) => (
          <div key={row.key} className="admin-assignment-row__pair">
            <label className="admin-form__field">
              <span>{t('admin.assignment.fileLabel')}</span>
              <input
                type="text"
                value={row.label}
                onChange={(e) => patch({ files: side.files.map((item) => (item.key === row.key ? { ...item, label: e.target.value } : item)) })}
              />
            </label>
            <label className="admin-form__field">
              <span>{t('admin.assignment.fileUrl')}</span>
              <input
                type="text"
                placeholder="https://"
                value={row.url}
                onChange={(e) => patch({ files: side.files.map((item) => (item.key === row.key ? { ...item, url: e.target.value } : item)) })}
              />
            </label>
            <button type="button" className="admin-form__cancel" onClick={() => patch({ files: side.files.filter((item) => item.key !== row.key) })}>
              {t('admin.assignment.removeItem')}
            </button>
          </div>
        ))}
        <button type="button" className="admin-form__cancel admin-form__add" onClick={() => patch({ files: [...side.files, newFileRow()] })}>
          {t('admin.assignment.addFile')}
        </button>
      </div>
    </fieldset>
  )
}

function AdminCompareEditor({ value, onChange }) {
  const { t } = useLanguage()

  return (
    <fieldset className="admin-assignment-row">
      <label className="admin-assignment-row__inline">
        <input type="checkbox" checked={value.enabled} onChange={(e) => onChange({ ...value, enabled: e.target.checked })} />
        {t('admin.compare.enable')}
      </label>
      <p className="admin-hint">{t('admin.compare.hint')}</p>

      {value.enabled && (
        <>
          <SideEditor title={t('admin.compare.left')} side={value.left} onChange={(left) => onChange({ ...value, left })} />
          <SideEditor title={t('admin.compare.right')} side={value.right} onChange={(right) => onChange({ ...value, right })} />
        </>
      )}
    </fieldset>
  )
}

export default AdminCompareEditor
