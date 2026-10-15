import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { fileExtension } from './FilePreview'
import './DocumentViewer.css'

function PdfPages({ url, onStatus }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    container.replaceChildren()
    let cancelled = false
    let task = null

    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default

        task = pdfjs.getDocument({ url })
        const pdf = await task.promise
        if (cancelled) return

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber)
          if (cancelled) return

          const base = page.getViewport({ scale: 1 })
          const ratio = window.devicePixelRatio || 1
          const viewport = page.getViewport({ scale: (container.clientWidth / base.width) * ratio })

          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          canvas.className = 'doc-viewer__page'
          container.appendChild(canvas)

          await page.render({ canvasContext: canvas.getContext('2d'), canvas, viewport }).promise
          if (cancelled) return
          if (pageNumber === 1) onStatus('ready')
        }
      } catch (error) {
        console.error('PDF render failed', error)
        if (!cancelled) onStatus('error')
      }
    })()

    return () => {
      cancelled = true
      try {
        Promise.resolve(task?.destroy()).catch(() => {})
      } catch {
        // nothing to release if the document never finished loading
      }
    }
  }, [url, onStatus])

  return <div ref={containerRef} className="doc-viewer__pages" />
}

function sanitizeHtml(html) {
  const template = document.createElement('template')
  template.innerHTML = html
  template.content.querySelectorAll('script, iframe, object, embed, style').forEach((node) => node.remove())
  template.content.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href') ?? ''
    if (/^(https?:|mailto:)/i.test(href)) {
      anchor.setAttribute('target', '_blank')
      anchor.setAttribute('rel', 'noreferrer')
    } else {
      anchor.removeAttribute('href')
    }
  })
  return template.innerHTML
}

function DocxText({ url, onStatus }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const [{ default: mammoth }, response] = await Promise.all([
          import('mammoth/mammoth.browser'),
          fetch(url),
        ])
        if (!response.ok) throw new Error('fetch failed')
        const result = await mammoth.convertToHtml({ arrayBuffer: await response.arrayBuffer() })
        if (cancelled) return
        setHtml(sanitizeHtml(result.value))
        onStatus('ready')
      } catch {
        if (!cancelled) onStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [url, onStatus])

  return <div className="doc-viewer__text" dangerouslySetInnerHTML={{ __html: html }} />
}

function DocumentViewer({ url, title, onClose }) {
  const extension = fileExtension(url)
  const kind = extension === 'pdf' ? 'pdf' : extension === 'docx' ? 'docx' : 'viewer'
  const [status, setStatus] = useState(kind === 'viewer' ? 'ready' : 'loading')

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`

  return createPortal(
    <div className="doc-viewer" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="doc-viewer__panel" onClick={(event) => event.stopPropagation()}>
        <header className="doc-viewer__header">
          <span className="doc-viewer__title">{title}</span>
          <button type="button" className="doc-viewer__close" onClick={onClose} aria-label="닫기">
            닫기 ✕
          </button>
        </header>

        <div className="doc-viewer__body" onContextMenu={(event) => event.preventDefault()}>
          {status === 'loading' && <p className="doc-viewer__message">대본을 불러오는 중이에요…</p>}
          {status === 'error' && (
            <p className="doc-viewer__message doc-viewer__message--error">대본을 불러오지 못했어요.</p>
          )}
          {kind === 'pdf' && <PdfPages url={url} onStatus={setStatus} />}
          {kind === 'docx' && <DocxText url={url} onStatus={setStatus} />}
          {kind === 'viewer' && <iframe className="doc-viewer__frame" src={viewerUrl} title={title} />}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default DocumentViewer
