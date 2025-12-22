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
import { Head, router } from '@inertiajs/react';
import { ChevronDownIcon, Download, FileText } from 'lucide-react';
import { useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface User {
    id: number;
    name: string;
}

interface Asset {
    id: number;
    name: string;
}

interface Borrowing {
    id: number;
    borrow_date: string;
    return_date: string | null;
    asset_condition: 'Sesuai' | 'Rusak' | 'Hilang';
    status: string;
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
}

export default function Reports({ borrowings, stats, filters }: ReportsProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [status, setStatus] = useState(filters.status ?? 'all');

    const [dateStart, setDateStart] = useState<Date | undefined>(
        filters.start_date ? new Date(filters.start_date) : undefined,
    );
    const [dateEnd, setDateEnd] = useState<Date | undefined>(
        filters.end_date ? new Date(filters.end_date) : undefined,
    );

    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);

    const [exportAlert, setExportAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const formatDate = (date?: Date) => {
        if (!date) return '';
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const applyFilter = (params: {
        start_date?: string;
        end_date?: string;
        status?: string;
        page?: number;
    }) => {
        router.get(
            '/reports',
            {
                start_date: startDate,
                end_date: endDate,
                status,
                ...params,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const onSelectStartDate = (date?: Date) => {
        setDateStart(date);
        if (date) {
            const formatted = formatDate(date);
            setStartDate(formatted);
            applyFilter({ start_date: formatted, page: 1 });
        }
        setOpenStart(false);
    };

    const onSelectEndDate = (date?: Date) => {
        setDateEnd(date);
        if (date) {
            const formatted = formatDate(date);
            setEndDate(formatted);
            applyFilter({ end_date: formatted, page: 1 });
        }
        setOpenEnd(false);
    };

    return (
        <AppLayout>
            <Head title="Laporan" />
            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Laporan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="start-date" className="px-1">
                                    Tanggal Mulai
                                </Label>
                                <Popover
                                    open={openStart}
                                    onOpenChange={setOpenStart}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="start-date"
                                            className="w-48 justify-between font-normal"
                                        >
                                            {dateStart
                                                ? dateStart.toLocaleDateString()
                                                : 'Pilih tanggal mulai'}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto overflow-hidden p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={dateStart}
                                            captionLayout="dropdown"
                                            onSelect={onSelectStartDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Label htmlFor="end-date" className="px-1">
                                    Tanggal Akhir
                                </Label>
                                <Popover
                                    open={openEnd}
                                    onOpenChange={setOpenEnd}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="end-date"
                                            className="w-48 justify-between font-normal"
                                        >
                                            {dateEnd
                                                ? dateEnd.toLocaleDateString()
                                                : 'Pilih tanggal akhir'}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto overflow-hidden p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={dateEnd}
                                            captionLayout="dropdown"
                                            onSelect={onSelectEndDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(value) => {
                                        setStatus(value);
                                        applyFilter({
                                            status: value,
                                            page: 1,
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-full rounded border px-3 py-2">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua
                                        </SelectItem>
                                        <SelectItem value="Pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="Disetujui">
                                            Disetujui
                                        </SelectItem>
                                        <SelectItem value="Ditolak">
                                            Ditolak
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="invisible">Export PDF</Label>
                                <Button
                                    variant="outline"
                                    className="gap-2 bg-transparent"
                                    onClick={() =>
                                        window.open(
                                            '/reports/export/pdf',
                                            '_blank',
                                        )
                                    }
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
                                    onClick={() =>
                                        (window.location.href =
                                            '/reports/export/excel')
                                    }
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
                                                        item.status ===
                                                        'Disetujui'
                                                            ? 'success'
                                                            : item.status ===
                                                                'Pending'
                                                              ? 'warning'
                                                              : 'destructive'
                                                    }
                                                >
                                                    {item.status}
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
                            onPageChange={(page) => applyFilter({ page })}
                        />
                    </CardContent>
                </Card>

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
