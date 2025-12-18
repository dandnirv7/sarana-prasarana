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

export function AppSidebar() {
  const { auth } = usePage().props as any

  console.log(auth)
  const permissions: string[] = auth.permissions ?? []

  const visibleItems = sidebarItems.filter(item =>
    can(permissions, item.permission)
  )

  console.log(permissions)

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
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
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
