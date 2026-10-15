import { useEffect, useState } from 'react'
import { categories } from '../data/works'
import { fetchSetting, saveSetting } from '../lib/settings'
import { NAV_ORDER_KEY, sortByOrder } from '../lib/navOrder'
import SortableList from './SortableList'
import { useLanguage } from '../i18n/LanguageContext'

function AdminMenuSection() {
  const { t } = useLanguage()
  const [items, setItems] = useState(null)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchSetting(NAV_ORDER_KEY)
      .then((order) => {
        setItems(sortByOrder(categories, order))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  async function reorder(next) {
    const previous = items
    setItems(next)
    setMessage({ type: '', text: '' })
    try {
      await saveSetting(NAV_ORDER_KEY, next.map((item) => item.key))
      setMessage({ type: 'ok', text: t('admin.menu.saved') })
    } catch {
      setItems(previous)
      setMessage({ type: 'error', text: t('common.orderFailed') })
    }
  }

  return (
    <section className="admin-page__section">
      <h2 className="admin-page__subtitle">{t('admin.menu.title')}</h2>
      <p className="admin-hint">{t('admin.menu.hint')}</p>
      {status === 'loading' && <p className="status-message">{t('common.loading')}</p>}
      {status === 'error' && <p className="status-message status-message--error">{t('admin.menu.loadFailed')}</p>}
      {status === 'ready' && (
        <SortableList
          items={items.map((item) => ({ ...item, id: item.key }))}
          onReorder={reorder}
          className="admin-list"
          itemClassName="admin-list__item"
          renderItem={(item, handle) => (
            <>
              {handle}
              <div className="admin-list__info">
                <span className="admin-list__title">{t(`nav.${item.key}`)}</span>
              </div>
            </>
          )}
        />
      )}
      {message.text && (
        <p className={message.type === 'error' ? 'status-message status-message--error' : 'admin-form__ok'}>
          {message.text}
        </p>
      )}
    </section>
  )
}

export default AdminMenuSection
