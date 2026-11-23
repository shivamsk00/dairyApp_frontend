import { useEffect } from 'react'

/**
 * Sets the window title to "<title> | <base title>" while the calling component is mounted and
 * restores the previous title afterwards. The base title is whatever index.html sets (सरस डेयरी).
 *
 * React equivalent of the dreamsCare `head/title-meta` component.
 *
 * @param {string} [title] Falsy leaves the title unchanged.
 */
const useDocumentTitle = (title) => {
  useEffect(() => {
    if (!title) return undefined
    const previous = document.title
    const base = previous.split(' | ').pop()
    document.title = `${title} | ${base}`
    return () => {
      document.title = previous
    }
  }, [title])
}

export default useDocumentTitle
