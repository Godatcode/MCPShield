import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <>
      {/* Animated gradient background — fixed, behind everything */}
      <div className="dashboard-bg" />
      <div className="noise-overlay" />

      {/* App shell — sits above the background */}
      <div className="relative z-10 flex h-full min-h-screen">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  )
}
