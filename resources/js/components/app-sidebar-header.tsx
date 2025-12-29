import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';
import { Breadcrumbs } from './breadcrumbs';
import { Badge } from './ui/badge';
import { SidebarTrigger } from './ui/sidebar';

const roleColors = {
    Admin: 'default',
    Staff: 'secondary',
    Manager: 'destructive',
} as const;

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const { auth } = page.props as any;
    const user = auth.user;
    const role = auth.user.roles[0].name;

    const avatar = user.name
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase())
        .join('');

    return (
        <header className="sticky top-0 z-30 w-full border-b border-sidebar-border/50 bg-background">
            <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-3 md:min-h-16 md:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />

                    {breadcrumbs.length > 0 && (
                        <div className="border-t border-sidebar-border/40 px-4 py-2 md:px-2 lg:px-4">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                    )}
                </div>

                {user && (
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {user.department}
                            </p>
                        </div>

                        <Badge
                            variant={
                                roleColors[role as keyof typeof roleColors]
                            }
                        >
                            {role}
                        </Badge>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 md:h-10 md:w-10">
                            <span className="text-sm font-semibold text-primary">
                                {avatar}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
