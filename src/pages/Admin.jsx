import { useEffect, useState } from 'react'
import { useSession } from '../hooks/useSession'
import { ADMIN_UID, signOutAdmin } from '../lib/auth'
import { fetchProjects, deleteProject } from '../lib/projects'
import { fetchGames, deleteGame } from '../lib/games'
import LoginForm from '../components/LoginForm'
import AdminProjectForm from '../components/AdminProjectForm'
import AdminGameForm from '../components/AdminGameForm'
import AdminProfileSection from '../components/AdminProfileSection'
import AdminAssignmentSection from '../components/AdminAssignmentSection'
import AdminMenuSection from '../components/AdminMenuSection'
import SortableList from '../components/SortableList'
import SmartImage from '../components/SmartImage'
import { saveOrder } from '../lib/ordering'
import { useLanguage } from '../i18n/LanguageContext'
import './Admin.css'

const TABS = [
  { key: 'profile', labelKey: 'nav.profile' },
  { key: 'video', labelKey: 'nav.video' },
  { key: 'script', labelKey: 'nav.script' },
  { key: 'game', labelKey: 'nav.game' },
  { key: 'assignments', labelKey: 'nav.assignments' },
  { key: 'menu', labelKey: 'admin.tab.menu' },
]

function AdminCategorySection({ category, label }) {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [listStatus, setListStatus] = useState('loading')
  const [editingItem, setEditingItem] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function load() {
    setListStatus('loading')
    try {
      const data = await fetchProjects(category)
      setItems(data)
      setListStatus('ready')
    } catch {
      setListStatus('error')
    }
  }

  useEffect(() => {
    load()
    setEditingItem(null)
    setPendingDeleteId(null)
  }, [category])

  async function reorder(next) {
    const previous = items
    setItems(next)
    setDeleteError('')
    try {
      await saveOrder('projects', next.map((item) => item.id))
    } catch {
      setItems(previous)
      setDeleteError(t('common.orderFailed'))
    }
  }

  async function confirmDelete(item) {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteProject(item)
      setPendingDeleteId(null)
      load()
    } catch {
      setDeleteError(t('common.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">{editingItem ? t('admin.category.edit', { label }) : t('admin.category.new', { label })}</h2>
        <AdminProjectForm
          key={editingItem?.id ?? 'new'}
          category={category}
          project={editingItem}
          onSaved={() => {
            setEditingItem(null)
            load()
          }}
          onCancel={() => setEditingItem(null)}
        />
      </section>

      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">{t('admin.category.registered', { label })}</h2>
        {deleteError && <p className="status-message status-message--error">{deleteError}</p>}
        {listStatus === 'loading' && <p className="status-message">{t('common.loading')}</p>}
        {listStatus === 'error' && (
          <p className="status-message status-message--error">{t('common.listLoadFailed')}</p>
        )}
        {listStatus === 'ready' && items.length === 0 && (
          <p className="status-message">{t('admin.category.none', { label })}</p>
        )}
        {listStatus === 'ready' && items.length > 0 && (
          <>
            <p className="admin-hint">{t('admin.hintDrag')}</p>
            <SortableList
              items={items}
              onReorder={reorder}
              className="admin-list"
              itemClassName="admin-list__item"
              renderItem={(item, handle) => (
                <>
                  {handle}
                  <div className="admin-list__thumb">
                    <SmartImage src={item.image_url} alt={item.title} label="" hoverEffect={false} />
                  </div>
                  <div className="admin-list__info">
                    <span className="admin-list__title">{item.title}</span>
                    <p className="admin-list__preview">{item.description || t('common.noDescription')}</p>
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
      </section>
    </>
  )
}

function AdminGameSection() {
  const { t } = useLanguage()
  const [games, setGames] = useState([])
  const [listStatus, setListStatus] = useState('loading')
  const [editingGame, setEditingGame] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function load() {
    setListStatus('loading')
    try {
      const data = await fetchGames()
      setGames(data)
      setListStatus('ready')
    } catch {
      setListStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function reorder(next) {
    const previous = games
    setGames(next)
    setDeleteError('')
    try {
      await saveOrder('games', next.map((game) => game.id))
    } catch {
      setGames(previous)
      setDeleteError(t('common.orderFailed'))
    }
  }

  async function confirmDelete(game) {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteGame(game)
      setPendingDeleteId(null)
      load()
    } catch {
      setDeleteError(t('common.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">{editingGame ? t('admin.game.edit') : t('admin.game.new')}</h2>
        <AdminGameForm
          key={editingGame?.id ?? 'new'}
          game={editingGame}
          onSaved={() => {
            setEditingGame(null)
            load()
          }}
          onCancel={() => setEditingGame(null)}
        />
      </section>

      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">{t('admin.game.registered')}</h2>
        {deleteError && <p className="status-message status-message--error">{deleteError}</p>}
        {listStatus === 'loading' && <p className="status-message">{t('common.loading')}</p>}
        {listStatus === 'error' && (
          <p className="status-message status-message--error">{t('common.listLoadFailed')}</p>
        )}
        {listStatus === 'ready' && games.length === 0 && (
          <p className="status-message">{t('admin.game.none')}</p>
        )}
        {listStatus === 'ready' && games.length > 0 && (
          <>
            <p className="admin-hint">{t('admin.hintDrag')}</p>
            <SortableList
              items={games}
              onReorder={reorder}
              className="admin-list"
              itemClassName="admin-list__item"
              renderItem={(game, handle) => (
                <>
                  {handle}
                  <div className="admin-list__info">
                    <span className="admin-list__title">{game.title}</span>
                    <p className="admin-list__preview">{game.synopsis || t('admin.game.noSynopsis')}</p>
                  </div>
                  {pendingDeleteId === game.id ? (
                    <div className="admin-list__confirm">
                      <span>{t('common.confirmDelete')}</span>
                      <button type="button" onClick={() => confirmDelete(game)} disabled={deleting}>
                        {deleting ? t('common.deleting') : t('common.delete')}
                      </button>
                      <button type="button" onClick={() => setPendingDeleteId(null)} disabled={deleting}>
                        {t('common.cancel')}
                      </button>
                    </div>
                  ) : (
                    <div className="admin-list__actions">
                      <button type="button" onClick={() => setEditingGame(game)}>
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError('')
                          setPendingDeleteId(game.id)
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
      </section>
    </>
  )
}

function Admin() {
  const { t } = useLanguage()
  const { session, loading } = useSession()
  const [activeTab, setActiveTab] = useState('profile')

  const isAdmin = session?.user?.id === ADMIN_UID

  if (loading) {
    return (
      <div className="page-enter container admin-page">
        <p className="status-message">{t('admin.checking')}</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="page-enter container admin-page">
        <span className="eyebrow">{t('admin.eyebrow')}</span>
        <h1 className="admin-page__title">{t('admin.loginTitle')}</h1>
        <LoginForm />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="page-enter container admin-page">
        <span className="eyebrow">{t('admin.eyebrow')}</span>
        <h1 className="admin-page__title">{t('admin.noAccessTitle')}</h1>
        <p className="admin-page__description">{t('admin.noAccessText')}</p>
        <button type="button" className="admin-page__signout" onClick={signOutAdmin}>
          {t('admin.logout')}
        </button>
      </div>
    )
  }

  return (
    <div className="page-enter container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">{t('admin.eyebrow')}</span>
          <h1 className="admin-page__title">{t('admin.title')}</h1>
        </div>
        <button type="button" className="admin-page__signout" onClick={signOutAdmin}>
          {t('admin.logout')}
        </button>
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-tabs__item${activeTab === tab.key ? ' admin-tabs__item--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && <AdminProfileSection />}
      {activeTab === 'video' && <AdminCategorySection category="video" label={t('nav.video')} />}
      {activeTab === 'script' && <AdminCategorySection category="script" label={t('nav.script')} />}
      {activeTab === 'game' && <AdminGameSection />}
      {activeTab === 'assignments' && <AdminAssignmentSection />}
      {activeTab === 'menu' && <AdminMenuSection />}
    </div>
  )
}

export default Admin
