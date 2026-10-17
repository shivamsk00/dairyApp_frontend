import { useCallback, useEffect, useRef, useState } from 'react'
import CustomToast from '../../helper/costomeToast'

/**
 * Server-paged list used by the three inventory tables. `fetcher(page)` must resolve to the usual
 * `{ status_code, data: { data, current_page, last_page } }` response.
 */
export const usePagedList = (fetcher) => {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const load = useCallback(async (nextPage = 1) => {
    setLoading(true)
    try {
      const res = await fetcherRef.current(nextPage)
      if (res?.status_code == 200) {
        setRows(res.data.data)
        setPage(res.data.current_page)
        setPageCount(res.data.last_page)
      }
    } catch (error) {
      console.error('Error fetching inventory list:', error)
      CustomToast.error('Failed to load the list')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(1)
  }, [load])

  return { rows, page, pageCount, loading, load }
}
