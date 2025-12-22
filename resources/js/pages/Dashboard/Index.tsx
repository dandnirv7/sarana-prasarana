import StatCard from '@/components/common/stat-card';
import DashboardCharts from '@/components/dashboard/dashboard-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AlertCircle, CheckCircle, Package, TrendingUp } from 'lucide-react';

dayjs.extend(relativeTime).locale('id');

interface Stat {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend: string;
}

interface Activity {
    borrowing_id: number;
    user_name: string;
    borrowed_at: string;
}

interface DashboardProps {
    stats: {
        totalAssets: number;
        availableAssets: number;
        borrowedAssets: number;
        totalBorrowings: number;
        totalAssetsTrend: number;
        availableAssetsTrend: number;
        borrowedAssetsTrend: number;
        totalBorrowingsTrend: number;
        myBorrowings: number | null;
        pendingApprovals: number | null;
    };
    categoryData: { name: string; value: number }[];
    assetStatusData: { [status: string]: number };
    formattedAssetStatusData: {
        name: string;
        available: number;
        borrowed: number;
    }[];
    recentActivities: Activity[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({
    stats,
    categoryData,
    assetStatusData,
    formattedAssetStatusData,
    recentActivities,
}: DashboardProps) {
    const statistics: Stat[] = [
        {
            title: 'Total Aset',
            value: stats.totalAssets.toString(),
            icon: Package,
            color: 'bg-blue-100 text-blue-600',
            trend: `+${stats.totalAssetsTrend}% dari bulan lalu`,
        },
        {
            title: 'Aset Tersedia',
            value: stats.availableAssets.toString(),
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600',
            trend: `+${stats.availableAssetsTrend} aset baru`,
        },
        {
            title: 'Aset Dipinjam',
            value: stats.borrowedAssets.toString(),
            icon: AlertCircle,
            color: 'bg-yellow-100 text-yellow-600',
            trend: `-${stats.borrowedAssetsTrend} pengembalian`,
        },
        {
            title: 'Total Peminjaman',
            value: stats.borrowedAssets.toString(),
            icon: TrendingUp,
            color: 'bg-purple-100 text-purple-600',
            trend: `+${stats.totalBorrowingsTrend ?? '0'} bulan ini`,
        },
    ];

    const getAssetStatusPercentage = (status: string) => {
        const total = assetStatusData[status] ?? 0;
        const totalAssets = stats.totalAssets ?? 1;
        return ((total / totalAssets) * 100).toFixed(1);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-8 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statistics.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                <DashboardCharts
                    categoryData={categoryData}
                    formattedAssetStatusData={formattedAssetStatusData}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Aktivitas Terbaru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div
                                        key={activity.borrowing_id}
                                        className="flex items-start gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">
                                                Aset #
                                                {1000 + activity.borrowing_id}{' '}
                                                dipinjam
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {dayjs(
                                                    activity.borrowed_at,
                                                ).fromNow()}{' '}
                                                oleh {activity.user_name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status Aset</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {['Tersedia', 'Dipinjam', 'Rusak'].map((status) => (
                                <div key={status}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {status.charAt(0).toUpperCase() +
                                                status.slice(1)}
                                        </span>
                                        <span className="text-lg font-bold text-green-600">
                                            {getAssetStatusPercentage(status)}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted">
                                        <div
                                            className={`h-2 rounded-full ${
                                                status === 'Tersedia'
                                                    ? 'bg-green-500'
                                                    : status === 'Dipinjam'
                                                      ? 'bg-yellow-500'
                                                      : 'bg-red-500'
                                            }`}
                                            style={{
                                                width: `${getAssetStatusPercentage(status)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
