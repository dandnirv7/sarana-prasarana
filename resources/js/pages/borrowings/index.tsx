import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    Download,
    Eye,
    FileText,
    Plus,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import AlertToast from '@/components/common/alert-toast';
import DoubleConfirmationModal from '@/components/common/double-confirmation-modal';
import Modal from '@/components/common/modal';
import Pagination from '@/components/common/pagination';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/permission';
import borrowings from '@/routes/borrowings';
import { BreadcrumbItem } from '@/types';

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
    user_id: number;
    asset_id: number;
    borrow_date: string;
    return_date: string | null;
    actual_return_date: string | null;
    asset_condition: string | null;
    status: Status;
    created_at: string;
    updated_at: string;
    user: User;
    asset: Asset;
}

interface BorrowingsProps {
    borrowings: {
        data: Borrowing[];
        total: number;
        current_page: number;
        last_page: number;
    };
    filters: {
        search: string;
        status_id?: number;
    };
    auth: {
        permissions: string[];
    };
    users: User[];
    assets: Asset[];
    statuses: Status[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Peminjaman', href: borrowings.index.url() },
];

export default function Borrowings({
    borrowings,
    filters,
    auth,
    users,
    assets,
    statuses,
}: BorrowingsProps) {
    const permissions: string[] = auth.permissions ?? [];
    const createForm = useForm({
        user_id: '',
        asset_id: '',
        borrow_date: '',
        return_date: '',
    });

    const [createModalOpen, setCreateModalOpen] = useState(false);

    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState<number | ''>(filters?.status_id ?? '');
    const [selected, setSelected] = useState<Borrowing | null>(null);
    const [approveTarget, setApproveTarget] = useState<Borrowing | null>(null);
    const [rejectTarget, setRejectTarget] = useState<Borrowing | null>(null);
    const [returnTarget, setReturnTarget] = useState<Borrowing | null>(null);
    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const applyFilter = (params: {
        search?: string;
        status?: string;
        page?: number;
    }) => {
        router.get(
            '/borrowings',
            { search, status_id: status || undefined, ...params },
            { preserveState: true, replace: true },
        );
    };

    const submitBorrowing = () => {
        createForm.post('/borrowings', {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
                setAlert({
                    type: 'success',
                    message: 'Permintaan peminjaman dikirim',
                });
            },
            onError: () => {
                setAlert({
                    type: 'error',
                    message: 'Terjadi kesalahan pada form',
                });
            },
        });
    };

    const approveBorrowing = () => {
        if (!approveTarget) return;
        router.patch(
            `/borrowings/${approveTarget.id}/approve`,
            {},
            {
                onSuccess: () => {
                    setAlert({
                        type: 'success',
                        message: 'Peminjaman disetujui',
                    });
                    setApproveTarget(null);
                },
            },
        );
    };

    const rejectBorrowing = () => {
        if (!rejectTarget) return;
        router.patch(
            `/borrowings/${rejectTarget.id}/reject`,
            {},
            {
                onSuccess: () => {
                    setAlert({
                        type: 'success',
                        message: 'Peminjaman ditolak',
                    });
                    setRejectTarget(null);
                },
            },
        );
    };

    const confirmReturn = () => {
        if (!returnTarget) return;
        router.patch(
            `/borrowings/${returnTarget.id}/return`,
            {},
            {
                onSuccess: () => {
                    setAlert({
                        type: 'success',
                        message: 'Pengembalian dikonfirmasi',
                    });
                    setReturnTarget(null);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peminjaman" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="max-w-md flex-1">
                        <Label htmlFor="search">Cari Peminjaman</Label>
                        <Input
                            id="search"
                            placeholder="Cari peminjam atau aset..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                applyFilter({
                                    search: e.target.value,
                                    page: 1,
                                });
                            }}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select
                            value={status?.toString()}
                            onValueChange={(value) => {
                                setStatus(Number(value));
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
                                {statuses.map((s) => (
                                    <SelectItem key={s.id} value={s.name}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {can(permissions, 'borrow asset') && (
                            <Button onClick={() => setCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajukan Peminjaman
                            </Button>
                        )}
                        {can(permissions, 'manage users') && (
                            <>
                                <Button
                                    variant="outline"
                                    className="gap-2 bg-transparent"
                                    onClick={() =>
                                        window.open(
                                            '/borrowings/export/pdf',
                                            '_blank',
                                        )
                                    }
                                >
                                    <Download className="h-4 w-4" />
                                    PDF
                                </Button>

                                <Button
                                    variant="outline"
                                    className="gap-2 bg-transparent"
                                    onClick={() =>
                                        (window.location.href =
                                            '/borrowings/export/excel')
                                    }
                                >
                                    <FileText className="h-4 w-4" />
                                    Excel
                                </Button>
                            </>
                        )}
                        {createModalOpen && (
                            <Modal
                                isOpen
                                title="Ajukan Peminjaman"
                                onClose={() => setCreateModalOpen(false)}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Pilih User
                                        </label>
                                        <select
                                            className="w-full rounded border px-2 py-1"
                                            value={createForm.data.user_id}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'user_id',
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                -- Pilih User --
                                            </option>
                                            {users.map(
                                                (user: {
                                                    id: number;
                                                    name: string;
                                                }) => (
                                                    <option
                                                        key={user.id}
                                                        value={user.id}
                                                    >
                                                        {user.name}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        {createForm.errors.user_id && (
                                            <p className="text-sm text-red-600">
                                                {createForm.errors.user_id}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Pilih Aset
                                        </label>
                                        <select
                                            className="w-full rounded border px-2 py-1"
                                            value={createForm.data.asset_id}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'asset_id',
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                -- Pilih Aset --
                                            </option>
                                            {assets.map(
                                                (asset: {
                                                    id: number;
                                                    name: string;
                                                }) => (
                                                    <option
                                                        key={asset.id}
                                                        value={asset.id}
                                                    >
                                                        {asset.name}
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        {createForm.errors.asset_id && (
                                            <p className="text-sm text-red-600">
                                                {createForm.errors.asset_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Tanggal Pinjam
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full rounded border px-2 py-1"
                                            value={createForm.data.borrow_date}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'borrow_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {createForm.errors.borrow_date && (
                                            <p className="text-sm text-red-600">
                                                {createForm.errors.borrow_date}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Tanggal Kembali
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full rounded border px-2 py-1"
                                            value={createForm.data.return_date}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'return_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {createForm.errors.return_date && (
                                            <p className="text-sm text-red-600">
                                                {createForm.errors.return_date}
                                            </p>
                                        )}
                                    </div>

                                    <Button onClick={submitBorrowing}>
                                        Kirim Permintaan
                                    </Button>
                                </div>
                            </Modal>
                        )}
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Daftar Peminjaman ({borrowings.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Peminjam
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Aset
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Tgl. Pinjam
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Tgl. Kembali
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {borrowings.data.map((b: Borrowing) => (
                                        <tr
                                            key={b.id}
                                            className="border-b border-border transition-colors hover:bg-muted/50"
                                        >
                                            <td className="px-4 py-3">
                                                {b.user.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {b.asset.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {b.borrow_date}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {b.return_date ?? '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        b.status.name ===
                                                        'Menunggu'
                                                            ? 'warning'
                                                            : b.status.name ===
                                                                'Disetujui'
                                                              ? 'success'
                                                              : b.status
                                                                      .name ===
                                                                  'Dikembalikan'
                                                                ? 'secondary'
                                                                : 'destructive'
                                                    }
                                                >
                                                    {b.status.name}
                                                </Badge>
                                            </td>
                                            <td className="flex flex-wrap gap-2 py-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setSelected(b)
                                                    }
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {b.status.name ===
                                                    'Menunggu' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                setApproveTarget(
                                                                    b,
                                                                )
                                                            }
                                                        >
                                                            <CheckCircle className="mr-1 h-4 w-4" />
                                                            Setujui
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                setRejectTarget(
                                                                    b,
                                                                )
                                                            }
                                                        >
                                                            <XCircle className="mr-1 h-4 w-4" />
                                                            Tolak
                                                        </Button>
                                                    </>
                                                )}
                                                {b.status.name ===
                                                    'Disetujui' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setReturnTarget(b)
                                                        }
                                                    >
                                                        Konfirmasi Pengembalian
                                                    </Button>
                                                )}
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
                {selected && (
                    <Modal
                        isOpen
                        title="Detail Peminjaman"
                        onClose={() => setSelected(null)}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Nama Peminjam
                                </label>
                                <p>{selected.user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Nama Aset
                                </label>
                                <p>{selected.asset.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Tanggal Pinjam
                                    </label>
                                    <p>{selected.borrow_date}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Tanggal Kembali
                                    </label>
                                    <p>{selected.return_date}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Status
                                </label>
                                <Badge
                                    variant={
                                        selected.status.name === 'Menunggu'
                                            ? 'warning'
                                            : selected.status.name ===
                                                'Disetujui'
                                              ? 'success'
                                              : 'destructive'
                                    }
                                    className="mt-1"
                                >
                                    {selected.status.name}
                                </Badge>
                            </div>
                        </div>
                    </Modal>
                )}
                <DoubleConfirmationModal
                    isOpen={!!approveTarget}
                    title="Konfirmasi Peminjaman"
                    message={`Setujui peminjaman ${approveTarget?.asset.name}?`}
                    confirmText="Setujui"
                    onConfirm={approveBorrowing}
                    onCancel={() => setApproveTarget(null)}
                />
                <DoubleConfirmationModal
                    isOpen={!!rejectTarget}
                    title="Tolak Peminjaman"
                    message={`Tolak peminjaman ${rejectTarget?.asset.name}?`}
                    confirmText="Tolak"
                    onConfirm={rejectBorrowing}
                    onCancel={() => setRejectTarget(null)}
                />
                <DoubleConfirmationModal
                    isOpen={!!returnTarget}
                    title="Konfirmasi Pengembalian"
                    message={`Konfirmasi pengembalian ${returnTarget?.asset.name}?`}
                    confirmText="Konfirmasi"
                    onConfirm={confirmReturn}
                    onCancel={() => setReturnTarget(null)}
                />

                {alert && (
                    <AlertToast
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}
            </div>
        </AppLayout>
    );
}
