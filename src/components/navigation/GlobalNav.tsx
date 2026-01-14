'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, History as HistoryIcon, BookOpen, Info, Menu, X } from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  description?: string
}

export default function GlobalNav() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<string>('home')

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="h-5 w-5" suppressHydrationWarning />,
      href: '/',
      description: 'Main editor dashboard',
    },
    {
      id: 'history',
      label: 'History',
      icon: <HistoryIcon className="h-5 w-5" suppressHydrationWarning />,
      href: '/history',
      description: 'View all your activity',
    },
    {
      id: 'guide',
      label: 'How to Use',
      icon: <BookOpen className="h-5 w-5" suppressHydrationWarning />,
      href: '/guide',
      description: 'Learn the basics',
    },
    {
      id: 'about',
      label: 'About',
      icon: <Info className="h-5 w-5" suppressHydrationWarning />,
      href: '/about',
      description: 'About the project',
    },
  ]

  const handleNav = (item: NavItem) => {
    setActiveItem(item.id)
    router.push(item.href)
    setIsOpen(false)
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <button
        onClick={toggleMenu}
        className={`fixed top-4 right-4 z-50 p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg transition-all hover:bg-slate-800 ${isOpen ? 'ring-2 ring-blue-500' : ''}`}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" suppressHydrationWarning />
        ) : (
          <Menu className="h-6 w-6 text-slate-300" suppressHydrationWarning />
        )}
      </button>

      <div
        className={`fixed top-20 right-4 z-40 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl transition-all ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      >
        <div className="p-4">
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Navigation
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = activeItem === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className={isActive ? 'text-blue-500' : 'text-slate-400'}>
                    {item.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                    )}
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-2" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setActiveItem('home')
                router.push('/')
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <Home className="h-4 w-4" suppressHydrationWarning />
              <span>Back to Editor</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
