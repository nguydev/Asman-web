import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { userService } from '../../../api/services/userService.js'
import Icon from '../../../components/common/Icon.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import UserDetailModal from '../../../components/UserDetailModal.jsx'
import { Pagination } from '../../../components/ui/Pagination.jsx'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

const STATUS_STYLES = {
  pending: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  suspended: 'bg-red-500/15 text-red-600 dark:text-red-400',
  active: 'bg-green-500/15 text-green-600 dark:text-green-400',
  restricted: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  banned: 'bg-red-500/15 text-red-600 dark:text-red-400',
  deleted: 'bg-red-500/15 text-red-600 dark:text-red-400',
  normal: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
}
const STATUS_LABELS = { 
  pending: 'Pending', 
  suspended: 'Suspended', 
  active: 'Active',
  restricted: 'Restricted',
  banned: 'Banned',
  deleted: 'Deleted',
  normal: 'Normal',
}

const STAT_TILES = [
  { key: 'total', label: 'Total Users', icon: 'users', tone: 'bg-brand/10 text-brand dark:text-brand-dark' },
  { key: 'active', label: 'Active', icon: 'check', tone: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' },
  { key: 'pending', label: 'Pending', icon: 'clock', tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
  { key: 'suspended', label: 'Suspended', icon: 'ban', tone: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400' },
]

export default function Users() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [detailUser, setDetailUser] = useState(null)
  
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, suspended: 0 })
  const [totalRecords, setTotalRecords] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const deepLinkUserId = searchParams.get('user')

  const closeDetail = useCallback(() => {
    setDetailUser(null)
    if (searchParams.has('user')) {
      const next = new URLSearchParams(searchParams)
      next.delete('user')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!deepLinkUserId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await userService.getUser(deepLinkUserId)
        const user = res.data?.data || res.data
        if (!cancelled && user) setDetailUser(user)
      } catch (error) {
        console.error('Failed to open user from map link', error)
        if (!cancelled) {
          toast.error('Could not load that user profile.')
          const next = new URLSearchParams(searchParams)
          next.delete('user')
          setSearchParams(next, { replace: true })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [deepLinkUserId, setSearchParams])

  const fetchStats = async () => {
    try {
      const res = await userService.getStats()
      setStats(res.data?.data || res.data || { total: 0, active: 0, pending: 0, suspended: 0 })
    } catch (error) {
      console.error('Failed to fetch user stats', error)
    }
  }

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
      }
      if (activeTab !== 'all') {
        params.status = activeTab.toUpperCase()
      }
      if (searchQuery) {
        params.search = searchQuery
      }
      const res = await userService.getUsers(params)
      const data = res.data?.data || res.data || []
      const meta = res.data?.meta || { total: 0, totalPages: 1 }
      
      setUsers(data)
      setTotalRecords(meta.total || 0)
      setPageCount(meta.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch users', error)
      toast.error('Failed to load users.')
    } finally {
      setIsLoading(false)
    }
  }, [page, activeTab, searchQuery])

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  const handleSuspend = async (user) => {
    try {
      await userService.updateStatus(user.id, { status: 'SUSPENDED', reason: 'Admin suspended' })
      setUsers((prev) => prev.map(u => u.id === user.id ? { ...u, status: 'SUSPENDED' } : u))
      closeDetail()
      fetchStats()
      toast.success('User suspended successfully.')
    } catch (error) {
      toast.error('Failed to suspend user.')
    }
  }

  const handleToggleStatus = async (user) => {
    const isSuspended = user.status === 'SUSPENDED'
    const newStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED'
    try {
      await userService.updateStatus(user.id, { status: newStatus, reason: isSuspended ? null : 'Admin action' })
      setUsers((prev) => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
      fetchStats()
      toast.success(`User ${isSuspended ? 'reactivated' : 'suspended'} successfully.`)
    } catch (error) {
      toast.error(`Failed to ${isSuspended ? 'reactivate' : 'suspend'} user.`)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await userService.deleteUser(userId)
      setUsers((prev) => prev.map(u => u.id === userId ? { ...u, isDeleted: true } : u))
      fetchStats()
      toast.success('User deleted successfully.')
    } catch (error) {
      toast.error('Failed to delete user.')
    }
  }

  const handleRestore = async (userId) => {
    try {
      await userService.restoreUser(userId)
      setUsers((prev) => prev.map(u => u.id === userId ? { ...u, isDeleted: false } : u))
      fetchStats()
      toast.success('User restored successfully.')
    } catch (error) {
      toast.error('Failed to restore user.')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_TILES.map((s) => (
          <div
            key={s.key}
            className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition group-hover:scale-110 ${s.tone}`}>
              <Icon name={s.icon} size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {s.label}
              </p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {stats[s.key] || 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* filters & search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-2 pr-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-1 overflow-x-auto p-1">
          {['all', 'active', 'pending', 'suspended'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition ${
                activeTab === tab
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      </div>

      {/* user table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <th className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-300">User</th>
              <th className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-300">Email</th>
              <th className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-300">Phone</th>
              <th className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-300">Status</th>
              <th className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-300">Joined</th>
              <th className="px-5 py-4 text-right font-semibold text-zinc-900 dark:text-zinc-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-zinc-500">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-zinc-500">No users found.</td>
              </tr>
            ) : (
              users.map((u) => {
                let statusKey = 'normal'
                if (u.isDeleted) statusKey = 'deleted'
                else if (!u.isEmailVerified) statusKey = 'pending'
                else if (u.isActive) statusKey = 'active'
                else if (u.status === 'ACTIVE') statusKey = 'normal'
                else statusKey = u.status?.toLowerCase() || 'normal'

                return (
                  <tr key={u.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {u.profile?.avatarUrl ? (
                             <img
                               src={u.profile.avatarUrl}
                               alt={u.profile?.name || 'User'}
                               className="h-10 w-10 rounded-full object-cover ring-2 ring-brand/10"
                             />
                          ) : (
                             <div className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                               <Icon name="user" size={20} />
                             </div>
                          )}
                        </div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-50">{u.profile?.name || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-500">{u.email}</td>
                    <td className="px-5 py-4 text-zinc-500">{u.phone || 'N/A'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[statusKey] || STATUS_STYLES.normal}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {STATUS_LABELS[statusKey] || statusKey}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          icon="eye"
                          onClick={() => setDetailUser(u)}
                          title="View"
                        />
                        {!u.isDeleted && (
                          u.status === 'SUSPENDED' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              icon="check"
                              title="Reactivate"
                              onClick={() => handleToggleStatus(u)}
                              className="text-green-600 hover:text-green-700"
                            />
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              icon="ban"
                              title="Suspend"
                              onClick={() => handleToggleStatus(u)}
                              className="hover:text-amber-500"
                            />
                          )
                        )}
                        {!u.isDeleted ? (
                          <Button
                            variant="danger"
                            size="icon"
                            icon="trash"
                            title="Delete"
                            onClick={() => handleDelete(u.id)}
                          />
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            icon="sync"
                            title="Restore"
                            onClick={() => handleRestore(u.id)}
                            className="text-green-600 hover:text-green-700"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <Pagination
        currentPage={page}
        totalPages={pageCount}
        totalItems={totalRecords}
        itemsPerPage={PAGE_SIZE}
        onPageChange={setPage}
      />

      <UserDetailModal
        open={!!detailUser}
        user={detailUser}
        onClose={closeDetail}
        onSuspend={handleSuspend}
      />
    </div>
  )
}
