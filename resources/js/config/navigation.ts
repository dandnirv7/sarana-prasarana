import {
    BarChart3,
    LayoutDashboard,
    List,
    Lock,
    Package,
    RotateCcw,
    Settings,
    Share2,
    Tag,
    User,
    Users,
} from 'lucide-react';
import { ElementType } from 'react';

export type SidebarItem = {
    title: string;
    href?: string;
    icon: ElementType;
    permission?: string;
    items?: SidebarItem[];
};

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
        title: 'Pengaturan',
        icon: Settings,
        items: [
            {
                title: 'Profil',
                href: '/settings/profile',
                icon: User,
            },
            {
                title: 'Kata Sandi',
                href: '/settings/password',
                icon: Lock,
            },
            {
                title: 'Kategori Aset',
                href: '/settings/categories',
                icon: List,
            },
            {
                title: 'Status',
                href: '/settings/statuses',
                icon: Tag,
            },
        ],
    },
];
