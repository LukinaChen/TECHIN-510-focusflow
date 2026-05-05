'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navLink = (href: string, label: string) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors pb-0.5 ${
          active
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-slate-600 hover:text-indigo-600 border-b-2 border-transparent'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="text-lg font-bold text-indigo-600 tracking-tight">FocusFlow</span>

        <div className="flex items-center gap-6">
          {navLink('/timer', 'Timer')}
          {navLink('/dashboard', 'Dashboard')}
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
