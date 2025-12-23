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

export function AppSidebar() {
    const page = usePage();
    const { auth } = page.props as any;
    const url = page.url;

    const permissions: string[] = auth.permissions ?? [];

    const visibleItems = sidebarItems.filter((item) =>
        can(permissions, item.permission),
    );

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return url === '/dashboard';
        }
        return url.startsWith(href);
    };

    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const [collapsed, setCollapsed] = useState<string | null>(null);

    const toggleCollapse = (title: string) => {
        setCollapsed(collapsed === title ? null : title);
    };

    useEffect(() => {
        visibleItems.forEach((item) => {
            if (
                item.items &&
                item.items.some(
                    (subItem) => subItem.href && url.startsWith(subItem.href),
                )
            ) {
                setCollapsed(item.title);
            }
        });
    }, [url, visibleItems]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const active = item.href ? isActive(item.href) : false;

                        const hasChildren = (item.items?.length ?? 0) > 0;
                        const isCollapsed = collapsed === item.title;

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    className={cn(
                                        'flex h-12 items-center font-bold transition-colors',
                                        active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted',
                                    )}
                                    onClick={(e) => {
                                        if (hasChildren) {
                                            e.preventDefault();
                                            toggleCollapse(item.title);
                                        }
                                    }}
                                >
                                    <Link href={hasChildren ? '#' : item.href}>
                                        <Icon className="h-12 w-12" />
                                        <span>{item.title}</span>
                                        {hasChildren &&
                                            (collapsed === item.title ? (
                                                <ChevronUp className="ml-auto h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="ml-auto h-5 w-5" />
                                            ))}
                                    </Link>
                                </SidebarMenuButton>

                                {hasChildren && isCollapsed && (
                                    <div className="mt-2 ml-4 border-l-2 border-muted pl-2 transition-all duration-300">
                                        <SidebarMenu>
                                            {item.items?.map((subItem) => {
                                                const subItemActive =
                                                    subItem.href
                                                        ? isActive(subItem.href)
                                                        : false;

                                                return (
                                                    <SidebarMenuItem
                                                        key={subItem.title}
                                                    >
                                                        <SidebarMenuButton
                                                            asChild
                                                            className={cn(
                                                                'flex h-10 items-center font-bold transition-colors',
                                                                subItemActive
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'hover:bg-muted',
                                                            )}
                                                        >
                                                            <Link
                                                                href={
                                                                    subItem.href
                                                                }
                                                            >
                                                                <subItem.icon className="h-12 w-12" />
                                                                <span>
                                                                    {
                                                                        subItem.title
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                );
                                            })}
                                        </SidebarMenu>
                                    </div>
                                )}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-full justify-start gap-2 border-transparent text-sm text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
                    asChild
                >
                    <Link href={logout()}>
                        <LogOut className="h-4 w-4" />
                        Keluar Sistem
                    </Link>
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
