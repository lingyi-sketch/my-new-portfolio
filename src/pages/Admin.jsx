import { useEffect, useState } from 'react'
import { useSession } from '../hooks/useSession'
import { ADMIN_UID, signOutAdmin } from '../lib/auth'
import { fetchProjects, deleteProject } from '../lib/projects'
import { fetchGames, deleteGame } from '../lib/games'
import LoginForm from '../components/LoginForm'
import AdminProjectForm from '../components/AdminProjectForm'
import AdminGameForm from '../components/AdminGameForm'
import SmartImage from '../components/SmartImage'
import './Admin.css'

const TABS = [
  { key: 'video', label: 'Video' },
  { key: 'script', label: 'Script' },
  { key: 'game', label: 'Game' },
]

function AdminCategorySection({ category, label }) {
  const [items, setItems] = useState([])
  const [listStatus, setListStatus] = useState('loading')
  const [editingItem, setEditingItem] = useState(null)

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
  }, [category])

  async function handleDelete(item) {
    if (!window.confirm(`"${item.title}"을(를) 삭제할까요? 업로드된 파일도 함께 삭제돼요.`)) return
    try {
      await deleteProject(item)
      load()
    } catch {
      window.alert('삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <>
      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">{editingItem ? `${label} 수정` : `새 ${label} 등록`}</h2>
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
        <h2 className="admin-page__subtitle">등록된 {label}</h2>
        {listStatus === 'loading' && <p className="status-message">불러오는 중이에요…</p>}
        {listStatus === 'error' && (
          <p className="status-message status-message--error">목록을 불러오지 못했어요.</p>
        )}
        {listStatus === 'ready' && items.length === 0 && (
          <p className="status-message">등록된 {label}이 없어요.</p>
        )}
        {listStatus === 'ready' && items.length > 0 && (
          <ul className="admin-list">
            {items.map((item) => (
              <li key={item.id} className="admin-list__item">
                <div className="admin-list__thumb">
                  <SmartImage src={item.image_url} alt={item.title} label="" hoverEffect={false} />
                </div>
                <div className="admin-list__info">
                  <span className="admin-list__title">{item.title}</span>
                  <p className="admin-list__preview">
                    {item.description || '설명이 없어요.'}
                  </p>
                </div>
                <div className="admin-list__actions">
                  <button type="button" onClick={() => setEditingItem(item)}>
                    수정
                  </button>
                  <button type="button" onClick={() => handleDelete(item)}>
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function AdminGameSection() {
  const [games, setGames] = useState([])
  const [listStatus, setListStatus] = useState('loading')
  const [editingGame, setEditingGame] = useState(null)

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

  async function handleDelete(game) {
    if (!window.confirm(`"${game.title}"을(를) 삭제할까요? 업로드된 영상도 함께 삭제돼요.`)) return
    try {
      await deleteGame(game)
      load()
    } catch {
      window.alert('삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <>
      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">{editingGame ? '게임 수정' : '새 게임 등록'}</h2>
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
        <h2 className="admin-page__subtitle">등록된 게임</h2>
        {listStatus === 'loading' && <p className="status-message">불러오는 중이에요…</p>}
        {listStatus === 'error' && (
          <p className="status-message status-message--error">목록을 불러오지 못했어요.</p>
        )}
        {listStatus === 'ready' && games.length === 0 && (
          <p className="status-message">등록된 게임이 없어요.</p>
        )}
        {listStatus === 'ready' && games.length > 0 && (
          <ul className="admin-list">
            {games.map((game) => (
              <li key={game.id} className="admin-list__item">
                <div className="admin-list__info">
                  <span className="admin-list__title">{game.title}</span>
                  <p className="admin-list__preview">{game.synopsis || '개요가 없어요.'}</p>
                </div>
                <div className="admin-list__actions">
                  <button type="button" onClick={() => setEditingGame(game)}>
                    수정
                  </button>
                  <button type="button" onClick={() => handleDelete(game)}>
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function Admin() {
  const { session, loading } = useSession()
  const [activeTab, setActiveTab] = useState('video')

  const isAdmin = session?.user?.id === ADMIN_UID

  if (loading) {
    return (
      <div className="page-enter container admin-page">
        <p className="status-message">확인하는 중이에요…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="page-enter container admin-page">
        <span className="eyebrow">Admin</span>
        <h1 className="admin-page__title">관리자 로그인</h1>
        <LoginForm />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="page-enter container admin-page">
        <span className="eyebrow">Admin</span>
        <h1 className="admin-page__title">권한이 없습니다</h1>
        <p className="admin-page__description">이 계정은 작품을 관리할 수 있는 관리자 계정이 아니에요.</p>
        <button type="button" className="admin-page__signout" onClick={signOutAdmin}>
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <div className="page-enter container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">Admin</span>
          <h1 className="admin-page__title">작품 관리</h1>
        </div>
        <button type="button" className="admin-page__signout" onClick={signOutAdmin}>
          로그아웃
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
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'video' && <AdminCategorySection category="video" label="Video" />}
      {activeTab === 'script' && <AdminCategorySection category="script" label="Script" />}
      {activeTab === 'game' && <AdminGameSection />}
    </div>
  )
}

export default Admin
