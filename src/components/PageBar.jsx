import './PageBar.css'

// Three short bars in the colours of the current page (see --bar-1..3 in index.css).
function PageBar() {
  return (
    <div className="page-bar" aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  )
}

export default PageBar
