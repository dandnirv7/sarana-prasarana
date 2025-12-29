import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { sidebarItems } from '@/config/navigation';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { can } from '@/lib/permission';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
import { Button } from './ui/button';
import { useSidebar } from './ui/sidebar';

export function AppSidebar() {
    const page = usePage();
    const { auth } = page.props as any;
    const url = page.url;

    const permissions: string[] = auth.permissions ?? [];

    const visibleItems = sidebarItems.filter((item) => {
        const hasPermission = item.permission
            ? can(permissions, item.permission)
            : true;

        if (item.items) {
            item.items = item.items.filter((subItem) =>
                subItem.permission
                    ? can(permissions, subItem.permission)
                    : true,
            );
        }

        return hasPermission;
    });

    const isActive = (href: string) => {
        if (href === '/dashboard') return url === '/dashboard';
        return url.startsWith(href);
    };

    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const { state, setOpen } = useSidebar();

    useEffect(() => {
        visibleItems.forEach((item) => {
            if (
                item.items &&
                item.items.some((sub) => sub.href && url.startsWith(sub.href))
            ) {
                setOpenMenu(item.title);
            }
        });
    }, [url]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Header */}
            <SidebarHeader className="border-b px-2 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent className="px-2 py-2">
                <SidebarMenu className="space-y-1">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const active = item.href ? isActive(item.href) : false;

                        const hasChildren = !!item.items?.length;
                        const opened = openMenu === item.title;

                        return (
                            <SidebarMenuItem key={item.title}>
                                {/* Parent */}
                                <SidebarMenuButton
                                    asChild
                                    onClick={(e) => {
                                        if (hasChildren) {
                                            e.preventDefault();

                                            // jika collapse, buka sidebar
                                            if (state === 'collapsed') {
                                                setOpen(true);
                                            }

                                            setOpenMenu(
                                                opened ? null : item.title,
                                            );
                                        }
                                    }}
                                    className={cn(
                                        'flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                                        active
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    <Link href={hasChildren ? '#' : item.href}>
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {item.title}
                                        </span>
                                        {hasChildren &&
                                            (opened ? (
                                                <ChevronUp className="ml-auto h-4 w-4 opacity-60" />
                                            ) : (
                                                <ChevronDown className="ml-auto h-4 w-4 opacity-60" />
                                            ))}
                                    </Link>
                                </SidebarMenuButton>

                                {/* Submenu */}
                                {hasChildren &&
                                    opened &&
                                    state !== 'collapsed' && (
                                        <div className="mt-1 ml-6 space-y-1">
                                            {item.items!.map((sub) => {
                                                const subActive = sub.href
                                                    ? isActive(sub.href)
                                                    : false;

                                                return (
                                                    <SidebarMenuButton
                                                        key={sub.title}
                                                        asChild
                                                        className={cn(
                                                            'flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                                                            subActive
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                        )}
                                                    >
                                                        <Link href={sub.href}>
                                                            <sub.icon className="h-4 w-4" />
                                                            <span>
                                                                {sub.title}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                );
                                            })}
                                        </div>
                                    )}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t px-2 py-3">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    onClick={handleLogout}
                    className="h-9 w-full justify-start gap-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                    <Link href={logout()} className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span
                            className={`transition-all duration-300 ease-in-out ${state !== 'collapsed' ? 'max-w-xs opacity-100' : 'max-w-0 overflow-hidden opacity-0'} `}
                        >
                            Keluar Sistem
                        </span>
                    </Link>
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
