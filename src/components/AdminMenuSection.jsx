import { useEffect, useState } from 'react'
import { categories } from '../data/works'
import { fetchSetting, saveSetting } from '../lib/settings'
import { NAV_ORDER_KEY, sortByOrder } from '../lib/navOrder'
import SortableList from './SortableList'

function AdminMenuSection() {
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
      setMessage({ type: 'ok', text: '메뉴 순서를 저장했어요.' })
    } catch {
      setItems(previous)
      setMessage({ type: 'error', text: '순서를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.' })
    }
  }

  return (
    <section className="admin-page__section">
      <h2 className="admin-page__subtitle">우측 상단 메뉴 순서</h2>
      <p className="admin-hint">
        왼쪽 ⋮⋮ 를 끌어서 순서를 바꾸면 사이트 상단 메뉴에 바로 반영돼요. (첫 화면은 항상 Profile이에요.)
      </p>
      {status === 'loading' && <p className="status-message">불러오는 중이에요…</p>}
      {status === 'error' && <p className="status-message status-message--error">불러오지 못했어요.</p>}
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
                <span className="admin-list__title">{item.label}</span>
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
