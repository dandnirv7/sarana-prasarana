import { Link, usePage } from '@inertiajs/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavUser } from '@/components/nav-user'
import AppLogo from './app-logo'
import { sidebarItems } from '@/config/navigation'
import { can } from '@/lib/permission'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const page = usePage()
  const { auth } = page.props as any
  const url = page.url

  const permissions: string[] = auth.permissions ?? []

  const visibleItems = sidebarItems.filter(item =>
    can(permissions, item.permission)
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return url === '/dashboard'
    }
    return url.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* HEADER */}
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

      {/* CONTENT */}
      <SidebarContent>
        <SidebarMenu>
          {visibleItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    'h-12 transition-colors font-bold',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="h-12 w-12" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
