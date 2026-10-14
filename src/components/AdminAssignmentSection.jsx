import { useEffect, useState } from 'react'
import { fetchAssignments, deleteAssignment, ASSIGNMENT_KINDS } from '../lib/assignments'
import AdminAssignmentForm from './AdminAssignmentForm'

function AdminAssignmentSection() {
  const [items, setItems] = useState([])
  const [listStatus, setListStatus] = useState('loading')
  const [editingItem, setEditingItem] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function load() {
    setListStatus('loading')
    try {
      setItems(await fetchAssignments())
      setListStatus('ready')
    } catch {
      setListStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function confirmDelete(item) {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAssignment(item)
      setPendingDeleteId(null)
      load()
    } catch {
      setDeleteError('삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setDeleting(false)
    }
  }

  const lastWeek = items.length ? items[items.length - 1].week : 1

  return (
    <>
      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">{editingItem ? '과제 수정' : '새 과제 등록'}</h2>
        <AdminAssignmentForm
          key={editingItem?.id ?? 'new'}
          assignment={editingItem}
          defaultWeek={lastWeek}
          onSaved={() => {
            setEditingItem(null)
            load()
          }}
          onCancel={() => setEditingItem(null)}
        />
      </section>

      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">등록된 과제</h2>
        {deleteError && <p className="status-message status-message--error">{deleteError}</p>}
        {listStatus === 'loading' && <p className="status-message">불러오는 중이에요…</p>}
        {listStatus === 'error' && (
          <p className="status-message status-message--error">목록을 불러오지 못했어요.</p>
        )}
        {listStatus === 'ready' && items.length === 0 && <p className="status-message">등록된 과제가 없어요.</p>}
        {listStatus === 'ready' && items.length > 0 && (
          <ul className="admin-list">
            {items.map((item) => (
              <li key={item.id} className="admin-list__item">
                <div className="admin-list__info">
                  <span className="admin-list__title">{item.title}</span>
                  <p className="admin-list__preview">
                    {item.week}주차 · {ASSIGNMENT_KINDS.find((kind) => kind.key === item.kind)?.label ?? item.kind}
                    {item.description ? ` · ${item.description}` : ''}
                  </p>
                </div>
                {pendingDeleteId === item.id ? (
                  <div className="admin-list__confirm">
                    <span>삭제할까요?</span>
                    <button type="button" onClick={() => confirmDelete(item)} disabled={deleting}>
                      {deleting ? '삭제 중…' : '삭제'}
                    </button>
                    <button type="button" onClick={() => setPendingDeleteId(null)} disabled={deleting}>
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="admin-list__actions">
                    <button type="button" onClick={() => setEditingItem(item)}>
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError('')
                        setPendingDeleteId(item.id)
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default AdminAssignmentSection
