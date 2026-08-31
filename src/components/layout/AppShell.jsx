import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileTabBar } from './MobileTabBar'
import { Toaster } from '@/components/ui/toaster'

export function AppShell({ children }) {
 const [collapsed, setCollapsed] = useState(false)
 const location = useLocation()

 return (
  <div className="min-h-screen flex bg-[#fbfbfd] dark:bg-neutral-950">
   <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
   <main className="flex-1 min-w-0 pb-20 md:pb-0">
    <motion.div
     key={location.pathname}
     initial={{ opacity: 0, y: 6 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
     className="px-5 md:px-8 py-6 md:py-8"
    >
     {children}
    </motion.div>
   </main>
   <MobileTabBar />
   <Toaster />
  </div>
 )
}
