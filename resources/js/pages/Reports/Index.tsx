import AlertToast from '@/components/common/alert-toast';
import Pagination from '@/components/common/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Download, FileText } from 'lucide-react';
import { useState } from 'react';

import DatePicker from '@/components/common/date-picker';
import ExportReportEmailModal from '@/components/reports/ExportEmailModal';
import { useInertiaFilter } from '@/hooks/use-inertia-filter';
import { BreadcrumbItem } from '@/types';
import dayjs from 'dayjs';

interface User {
    id: number;
    name: string;
}

interface Asset {
    id: number;
    name: string;
}

interface Status {
    id: number;
    name: string;
}

interface Borrowing {
    id: number;
    borrow_date: string;
    return_date: string | null;
    asset_condition: 'Sesuai' | 'Rusak' | 'Hilang';
    condition_status: 'Sesuai' | 'Rusak' | 'Hilang';
    asset_status: 'Sesuai' | 'Rusak' | 'Hilang';
    status: Status;
    user: User;
    asset: Asset;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedBorrowings {
    data: Borrowing[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
}

interface Stats {
    total: number;
    sesuai: number;
    rusak: number;
    hilang: number;
}

interface ReportsProps {
    borrowings: PaginatedBorrowings;
    stats: Stats;
    filters: {
        start_date: string;
        end_date: string;
        status: string;
    };
    statusConditions: string[];
}

const today = dayjs().format('YYYY-MM-DD');

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laporan', href: '/reports' }];

export default function Reports({
    borrowings,
    stats,
    filters,
    statusConditions,
}: ReportsProps) {
    const { errors } = usePage().props as any;

    const {
        filters: filterState,
        setFilters,
        apply,
    } = useInertiaFilter('/reports', {
        start_date: filters.start_date,
        end_date: filters.end_date,
        status: filters.status,
    });

    const [dateStart, setDateStart] = useState<string>(
        filterState.start_date || today,
    );
    const [dateEnd, setDateEnd] = useState<string>(
        filterState.end_date || today,
    );

    const [openExportModal, setOpenExportModal] = useState(false);
    const [exportType, setExportType] = useState<'pdf' | 'excel'>('pdf');

    const onSelectStartDate = (value: string) => {
        setDateStart(value);
        setFilters({ ...filterState, start_date: value });
    };

    const onSelectEndDate = (value: string) => {
        setDateEnd(value);
        setFilters({ ...filterState, end_date: value });
    };

    const [exportAlert, setExportAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan" />
            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Laporan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="space-y-2">
                                <DatePicker
                                    label="Tanggal Mulai"
                                    value={dateStart}
                                    onChange={onSelectStartDate}
                                />
                                {errors.start_date && (
                                    <p className="text-sm text-red-600">
                                        {errors.start_date}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <DatePicker
                                    label="Tanggal Akhir"
                                    value={dateEnd}
                                    defaultValue={today}
                                    onChange={onSelectEndDate}
                                />
                                {errors.end_date && (
                                    <p className="text-sm text-red-600">
                                        {errors.end_date}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={filterState.status}
                                    onValueChange={(value) => {
                                        setFilters({
                                            ...filterState,
                                            status: value.toLowerCase(),
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-full rounded border px-3 py-2">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="semua">
                                            Semua
                                        </SelectItem>
                                        {statusConditions.map((item) => (
                                            <SelectItem
                                                key={item}
                                                value={item.toLowerCase()}
                                            >
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="invisible">Export PDF</Label>
                                <Button
                                    variant="outline"
                                    className="gap-2 bg-transparent"
                                    onClick={() => {
                                        setExportType('pdf');
                                        setOpenExportModal(true);
                                    }}
                                >
                                    <Download className="h-4 w-4" />
                                    PDF
                                </Button>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="invisible">
                                    Export Excel
                                </Label>
                                <Button
                                    variant="outline"
                                    className="gap-2 bg-transparent"
                                    onClick={() => {
                                        setExportType('excel');
                                        setOpenExportModal(true);
                                    }}
                                >
                                    <FileText className="h-4 w-4" />
                                    Excel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Total Laporan
                                </p>
                                <p className="text-3xl font-bold">
                                    {stats.total}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Sesuai
                                </p>
                                <p className="text-3xl font-bold text-green-600">
                                    {stats.sesuai}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Rusak
                                </p>
                                <p className="text-3xl font-bold text-yellow-600">
                                    {stats.rusak}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Hilang
                                </p>
                                <p className="text-3xl font-bold text-red-600">
                                    {stats.hilang}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Detail Laporan Peminjaman & Pengembalian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Peminjam
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Nama Aset
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Tgl. Pinjam
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Tgl. Kembali
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Kondisi
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {borrowings.data.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="px-4 py-2">
                                                {item.user.name}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.asset.name}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.borrow_date}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.return_date ?? '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.asset_condition}
                                            </td>
                                            <td className="px-4 py-2">
                                                <Badge
                                                    variant={
                                                        !item.condition_status
                                                            ? 'destructive'
                                                            : item.condition_status ===
                                                                'Sesuai'
                                                              ? 'success'
                                                              : [
                                                                      'Rusak',
                                                                      'Rusak Ringan',
                                                                      'Rusak Berat',
                                                                      'Perbaikan',
                                                                      'Belum Diperbaiki',
                                                                  ].includes(
                                                                      item.condition_status,
                                                                  )
                                                                ? 'warning'
                                                                : item.condition_status ===
                                                                    'Hilang'
                                                                  ? 'destructive'
                                                                  : 'destructive'
                                                    }
                                                >
                                                    {!item.condition_status
                                                        ? 'Belum Dikembalikan'
                                                        : item.condition_status ===
                                                            'Sesuai'
                                                          ? 'Sesuai'
                                                          : [
                                                                  'Rusak',
                                                                  'Rusak Ringan',
                                                                  'Rusak Berat',
                                                                  'Perbaikan',
                                                                  'Belum Diperbaiki',
                                                              ].includes(
                                                                  item.condition_status,
                                                              )
                                                            ? 'Rusak'
                                                            : item.condition_status ===
                                                                'Hilang'
                                                              ? 'Hilang'
                                                              : 'Belum Dikembalikan'}
                                                    {/* {item.condition_status} */}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            currentPage={borrowings.current_page}
                            totalPages={borrowings.last_page}
                            onPageChange={(page) => apply({ page })}
                        />
                    </CardContent>
                </Card>

                <ExportReportEmailModal
                    isOpen={openExportModal}
                    onClose={() => setOpenExportModal(false)}
                    exportType={exportType}
                    filterState={{
                        startDate: filterState.start_date,
                        endDate: filterState.end_date,
                        status: filterState.status,
                    }}
                />

                {exportAlert && (
                    <AlertToast
                        type={exportAlert.type}
                        message={exportAlert.message}
                        onClose={() => setExportAlert(null)}
                    />
                )}
            </div>
        </AppLayout>
    );
}
