import { useEffect, useState } from 'react'
import { useSession } from '../hooks/useSession'
import { ADMIN_UID, signOutAdmin } from '../lib/auth'
import { fetchProjects, deleteProject } from '../lib/projects'
import LoginForm from '../components/LoginForm'
import AdminProjectForm from '../components/AdminProjectForm'
import './Admin.css'

function Admin() {
  const { session, loading } = useSession()
  const [projects, setProjects] = useState([])
  const [listStatus, setListStatus] = useState('loading')
  const [editingProject, setEditingProject] = useState(null)

  const isAdmin = session?.user?.id === ADMIN_UID

  async function loadProjects() {
    setListStatus('loading')
    try {
      const data = await fetchProjects()
      setProjects(data)
      setListStatus('ready')
    } catch {
      setListStatus('error')
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadProjects()
    }
  }, [isAdmin])

  async function handleDelete(id) {
    if (!window.confirm('이 작품을 삭제할까요?')) return
    try {
      await deleteProject(id)
      loadProjects()
    } catch {
      window.alert('삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

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
        <p className="works-page__description">이 계정은 작품을 관리할 수 있는 관리자 계정이 아니에요.</p>
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

      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">{editingProject ? '작품 수정' : '새 작품 등록'}</h2>
        <AdminProjectForm
          key={editingProject?.id ?? 'new'}
          project={editingProject}
          onSaved={() => {
            setEditingProject(null)
            loadProjects()
          }}
          onCancel={() => setEditingProject(null)}
        />
      </section>

      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">등록된 작품</h2>
        {listStatus === 'loading' && <p className="status-message">불러오는 중이에요…</p>}
        {listStatus === 'error' && (
          <p className="status-message status-message--error">목록을 불러오지 못했어요.</p>
        )}
        {listStatus === 'ready' && projects.length === 0 && (
          <p className="status-message">등록된 작품이 없어요.</p>
        )}
        {listStatus === 'ready' && projects.length > 0 && (
          <ul className="admin-list">
            {projects.map((project) => (
              <li key={project.id} className="admin-list__item">
                <span className="admin-list__title">{project.title}</span>
                <div className="admin-list__actions">
                  <button type="button" onClick={() => setEditingProject(project)}>
                    수정
                  </button>
                  <button type="button" onClick={() => handleDelete(project.id)}>
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Admin
