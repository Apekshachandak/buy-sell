'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState(undefined) // undefined = loading, null = logged out
  const [unread, setUnread] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const fetchedRef = useRef(false)

  // Fetch once on mount, then listen for auth events
  useEffect(() => {
    async function loadUser() {
      try {
        const d = await fetch('/api/auth/me').then(r => r.json())
        if (d.user) {
          setUser(d.user)
          const nd = await fetch('/api/notifications').then(r => r.json())
          setUnread(nd.unreadCount || 0)
        } else {
          setUser(null)
        }
      } catch { setUser(null) }
    }

    if (!fetchedRef.current) {
      fetchedRef.current = true
      loadUser()
    }

    // Re-check on custom auth events (fired after login/logout)
    function onAuthChange() {
      fetchedRef.current = false
      loadUser()
      fetchedRef.current = true
    }
    window.addEventListener('trove:auth', onAuthChange)
    return () => window.removeEventListener('trove:auth', onAuthChange)
  }, [])

  // Refresh unread count when navigating to/from dashboard
  useEffect(() => {
    if (user && pathname) {
      fetch('/api/notifications').then(r => r.json()).then(nd => {
        setUnread(nd.unreadCount || 0)
      }).catch(() => {})
    }
  }, [pathname, user])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setUnread(0)
    window.dispatchEvent(new Event('trove:auth'))
    router.push('/')
  }

  const isActive = (href) => pathname === href ? 'active' : ''

  // Don't flash on initial load
  if (user === undefined) return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">Trove<span>.</span></Link>
    </nav>
  )

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        Trove<span>.</span>
      </Link>
      <div className="navbar-links">
        <Link href="/browse" className={isActive('/browse')}>Browse</Link>
        <Link href="/iso" className={isActive('/iso')}>ISO Board</Link>
        {user && <Link href="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>}
      </div>
      <div className="navbar-actions">
        {user ? (
          <>
            <Link href="/listings/new" className="btn btn-primary btn-sm">+ List Item</Link>
            <Link
              href="/dashboard?tab=notifications"
              className="navbar-icon-btn"
              title="Notifications"
            >
              🔔
              {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
            </Link>
            <Link href={`/profile/${user._id}`} className="navbar-icon-btn">
              {user.name?.split(' ')[0]}
            </Link>
            <button onClick={handleLogout} className="navbar-icon-btn">Logout</button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="btn btn-outline btn-sm">Login</Link>
            <Link href="/auth/signup" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
