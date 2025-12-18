import {
  LayoutDashboard,
  Package,
  Share2,
  RotateCcw,
  BarChart3,
  Users,
  User,
} from 'lucide-react'

export type SidebarItem = {
  title: string
  href: string
  icon: any
  permission?: string
}

export const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Data Aset',
    href: '/assets',
    icon: Package,
    permission: 'manage assets',
  },
  {
    title: 'Peminjaman',
    href: '/borrowings',
    icon: Share2,
    permission: 'borrow asset',
  },
  {
    title: 'Pengembalian',
    href: '/returns',
    icon: RotateCcw,
    permission: 'return asset',
  },
  {
    title: 'Laporan',
    href: '/reports',
    icon: BarChart3,
    permission: 'view reports',
  },
  {
    title: 'Pengguna',
    href: '/users',
    icon: Users,
    permission: 'manage users',
  },
  {
    title: 'Profil',
    href: '/profile',
    icon: User,
  },
]
