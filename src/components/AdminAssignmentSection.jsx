import { useEffect, useState } from 'react'
import { fetchAssignments, deleteAssignment } from '../lib/assignments'
import { saveOrder } from '../lib/ordering'
import { fetchSetting, saveSetting } from '../lib/settings'
import { WEEK_ORDER_KEY, orderWeeks } from '../lib/weekOrder'
import AdminAssignmentForm from './AdminAssignmentForm'
import SortableList from './SortableList'
import { useLanguage } from '../i18n/LanguageContext'

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
  const { t } = useLanguage()
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
      setDeleteError(t('common.orderFailed'))
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
      setDeleteError(t('admin.assignment.weekOrderFailed'))
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
      setDeleteError(t('common.deleteFailed'))
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
        <h2 className="admin-page__subtitle">{editingItem ? t('admin.assignment.editTitle') : t('admin.assignment.newTitle')}</h2>
        {listStatus === 'loading' ? (
          <p className="status-message">{t('common.loading')}</p>
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
        <h2 className="admin-page__subtitle">{t('admin.assignment.registered')}</h2>
        {deleteError && <p className="status-message status-message--error">{deleteError}</p>}
        {listStatus === 'loading' && <p className="status-message">{t('common.loading')}</p>}
        {listStatus === 'error' && (
          <p className="status-message status-message--error">{t('common.listLoadFailed')}</p>
        )}
        {listStatus === 'ready' && items.length === 0 && <p className="status-message">{t('admin.assignment.none')}</p>}
        {listStatus === 'ready' && items.length > 0 && (
          <>
            <p className="admin-hint">{t('admin.assignment.hint')}</p>
            <SortableList
              items={weekGroups}
              onReorder={reorderWeeks}
              className="admin-week-list"
              itemClassName="admin-week-group"
              renderItem={(group, weekHandle) => (
                <>
                  <div className="admin-week-group__head">
                    {weekHandle}
                    <h3 className="admin-week-group__title">{t('assignments.week', { n: group.week })}</h3>
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
                            {item.course}
                            {item.description ? ` — ${item.description}` : ''}
                          </p>
                        </div>
                        {pendingDeleteId === item.id ? (
                          <div className="admin-list__confirm">
                            <span>{t('common.confirmDelete')}</span>
                            <button type="button" onClick={() => confirmDelete(item)} disabled={deleting}>
                              {deleting ? t('common.deleting') : t('common.delete')}
                            </button>
                            <button type="button" onClick={() => setPendingDeleteId(null)} disabled={deleting}>
                              {t('common.cancel')}
                            </button>
                          </div>
                        ) : (
                          <div className="admin-list__actions">
                            <button type="button" onClick={() => setEditingItem(item)}>
                              {t('common.edit')}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError('')
                                setPendingDeleteId(item.id)
                              }}
                            >
                              {t('common.delete')}
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
