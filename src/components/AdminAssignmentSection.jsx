import { useEffect, useState } from 'react'
import { fetchAssignments, deleteAssignment, ASSIGNMENT_KINDS } from '../lib/assignments'
import { saveOrder } from '../lib/ordering'
import { fetchSetting, saveSetting } from '../lib/settings'
import { WEEK_ORDER_KEY, orderWeeks } from '../lib/weekOrder'
import AdminAssignmentForm from './AdminAssignmentForm'
import SortableList from './SortableList'

function groupByWeek(items) {
  const weeks = new Map()
  for (const item of items) {
    if (!weeks.has(item.week)) weeks.set(item.week, [])
    weeks.get(item.week).push(item)
  }
  return weeks
}

function applyGroupOrder(items, week, nextGroup) {
  const result = []
  let inserted = false
  for (const item of items) {
    if (item.week !== week) {
      result.push(item)
    } else if (!inserted) {
      result.push(...nextGroup)
      inserted = true
    }
  }
  return result
}

function AdminAssignmentSection() {
  const [items, setItems] = useState([])
  const [weekOrder, setWeekOrder] = useState(null)
  const [listStatus, setListStatus] = useState('loading')
  const [editingItem, setEditingItem] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function load() {
    try {
      const [data, order] = await Promise.all([
        fetchAssignments(),
        fetchSetting(WEEK_ORDER_KEY).catch(() => null),
      ])
      setItems(data)
      setWeekOrder(order)
      setListStatus('ready')
    } catch {
      setListStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function reorder(week, nextGroup) {
    const previous = items
    setItems(applyGroupOrder(items, week, nextGroup))
    setDeleteError('')
    try {
      await saveOrder('site_assignments', nextGroup.map((item) => item.id))
    } catch {
      setItems(previous)
      setDeleteError('순서를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  async function reorderWeeks(nextGroups) {
    const previous = weekOrder
    const nextOrder = nextGroups.map((group) => group.week)
    setWeekOrder(nextOrder)
    setDeleteError('')
    try {
      await saveSetting(WEEK_ORDER_KEY, nextOrder)
    } catch {
      setWeekOrder(previous)
      setDeleteError('주차 순서를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

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

  const groups = groupByWeek(items)
  const weekGroups = orderWeeks([...groups.keys()], weekOrder).map((week) => ({
    id: `week-${week}`,
    week,
    items: groups.get(week),
  }))
  const lastWeek = items.length ? Math.max(...items.map((item) => item.week)) : 1

  return (
    <>
      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">{editingItem ? '과제 수정' : '새 과제 등록'}</h2>
        {listStatus === 'loading' ? (
          <p className="status-message">불러오는 중이에요…</p>
        ) : (
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
        )}
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
          <>
            <p className="admin-hint">
              항목 왼쪽의 ⋮⋮ 를 끌면 같은 주차 안에서, "N주차" 옆의 ⋮⋮ 를 끌면 주차끼리 순서가 바뀌고 바로 저장돼요.
            </p>
            <SortableList
              items={weekGroups}
              onReorder={reorderWeeks}
              className="admin-week-list"
              itemClassName="admin-week-group"
              renderItem={(group, weekHandle) => (
                <>
                  <div className="admin-week-group__head">
                    {weekHandle}
                    <h3 className="admin-week-group__title">{group.week}주차</h3>
                  </div>
                  <SortableList
                    items={group.items}
                    onReorder={(next) => reorder(group.week, next)}
                    className="admin-list"
                    itemClassName="admin-list__item"
                    renderItem={(item, handle) => (
                      <>
                        {handle}
                        <div className="admin-list__info">
                          <span className="admin-list__title">{item.title}</span>
                          <p className="admin-list__preview">
                            {ASSIGNMENT_KINDS.find((kind) => kind.key === item.kind)?.label ?? item.kind}
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
                      </>
                    )}
                  />
                </>
              )}
            />
          </>
        )}
      </section>
    </>
  )
}

export default AdminAssignmentSection
