import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, Download, Eye, FileText, Plus, XCircle } from 'lucide-react';
import { useState } from 'react';

import AlertToast from '@/components/common/alert-toast';
import DatePicker from '@/components/common/date-picker';
import DoubleConfirmationModal from '@/components/common/double-confirmation-modal';
import Modal from '@/components/common/modal';
import Pagination from '@/components/common/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInertiaFilter } from '@/hooks/use-inertia-filter';
import AppLayout from '@/layouts/app-layout';
import borrowings from '@/routes/borrowings';
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
        search?: string;
        status?: string;
    };
    auth: {
        permissions: string[];
    };
    users: User[];
    assets: Asset[];
    statuses: Status[];
}

interface Filter {
    search: string;
    status: string;
    page?: number;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Peminjaman', href: borrowings.index.url() }];

const today = dayjs().format('YYYY-MM-DD');

export default function Borrowings({ borrowings, auth, users, assets, statuses }: BorrowingsProps) {
    const permissions: string[] = auth.permissions ?? [];
    const createForm = useForm({ user_id: '', asset_id: '', borrow_date: '', return_date: '' });

    const pendingBorrowingCount = (borrowings.data as Borrowing[]).filter((p) =>
        ['Menunggu'].includes(p.status.name),
    ).length;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selected, setSelected] = useState<Borrowing | null>(null);
    const [approveTarget, setApproveTarget] = useState<Borrowing | null>(null);
    const [rejectTarget, setRejectTarget] = useState<Borrowing | null>(null);
    const [returnTarget, setReturnTarget] = useState<Borrowing | null>(null);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const { filters: filterState, setFilters, apply } = useInertiaFilter<Filter>('/borrowings', {
        search: '',
        status: 'all',
    });

    const isFormValid = () => {
        const { user_id, asset_id, borrow_date, return_date } = createForm.data;
        if (!user_id || !asset_id || !borrow_date) return false;
        if (return_date && new Date(return_date) < new Date(borrow_date)) return false;
        return true;
    };

    const submitBorrowing = () => {
        const errors: Record<string, string> = {};
        const { user_id, asset_id, borrow_date, return_date } = createForm.data;

        if (!user_id) errors.user_id = 'User wajib dipilih';
        if (!asset_id) errors.asset_id = 'Aset wajib dipilih';
        if (!borrow_date) errors.borrow_date = 'Tanggal pinjam wajib diisi';
        if (return_date && borrow_date && new Date(return_date) < new Date(borrow_date))
            errors.return_date = 'Tanggal kembali harus sama atau setelah tanggal pinjam';

        if (Object.keys(errors).length > 0) {
            createForm.setError(errors);
            return;
        }

        createForm.post('/borrowings', {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
                setAlert({ type: 'success', message: 'Permintaan peminjaman dikirim' });
            },
            onError: (errorsFromServer) => {
                createForm.setError(errorsFromServer);
                setAlert({ type: 'error', message: 'Terjadi kesalahan pada form' });
            },
        });
    };

    const closeCreateModal = () => {
        setCreateModalOpen(false);
        createForm.setData({ user_id: '', asset_id: '', borrow_date: today, return_date: '' });
        createForm.setError({});
    };

    const approveBorrowing = () => {
        if (!approveTarget) return;
        router.patch(`/borrowings/${approveTarget.id}/approve`, {}, {
            onSuccess: () => {
                setAlert({ type: 'success', message: 'Peminjaman disetujui' });
                setApproveTarget(null);
            },
        });
    };

    const rejectBorrowing = () => {
        if (!rejectTarget) return;
        router.patch(`/borrowings/${rejectTarget.id}/reject`, {}, {
            onSuccess: () => {
                setAlert({ type: 'success', message: 'Peminjaman ditolak' });
                setRejectTarget(null);
            },
        });
    };

    const confirmReturn = () => {
        if (!returnTarget) return;
        router.patch(`/borrowings/${returnTarget.id}/return`, {}, {
            onSuccess: () => {
                setAlert({ type: 'success', message: 'Pengembalian dikonfirmasi' });
                setReturnTarget(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peminjaman" />
            <div className="space-y-6 p-6">
                {pendingBorrowingCount > 0 && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                        Ada {pendingBorrowingCount} permintaan peminjaman yang menunggu persetujuan Anda.
                    </div>
                )}

                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div className="max-w-md flex-1">
                        <Label htmlFor="search">Cari Peminjaman</Label>
                        <Input
                            id="search"
                            placeholder="Cari peminjam atau aset..."
                            value={filterState.search}
                            onChange={(e) => setFilters({ ...filterState, search: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="status" className="sr-only">Status</Label>
                        <div className="flex gap-2">
                            <Select
                                value={filterState.status || 'all'}
                                onValueChange={(value) =>
                                    setFilters({ ...filterState, status: value === 'all' ? '' : value.toLowerCase(), page: 1 })
                                }
                            >
                                <SelectTrigger className="w-full rounded border px-3 py-2">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    {statuses.map((s) => (
                                        <SelectItem key={s.id} value={s.name.toLowerCase()}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {permissions.includes('borrow asset') && (
                                <Button onClick={() => setCreateModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />Ajukan Peminjaman
                                </Button>
                            )}
                            {permissions.includes('manage users') && (
                                <>
                                    <Button variant="outline" className="gap-2 bg-transparent" onClick={() => window.open('/borrowings/export/pdf', '_blank')}>
                                        <Download className="h-4 w-4" />PDF
                                    </Button>
                                    <Button variant="outline" className="gap-2 bg-transparent" onClick={() => (window.location.href = '/borrowings/export/excel')}>
                                        <FileText className="h-4 w-4" />Excel
                                    </Button>
                                </>
                            )}
                        </div>
                        {createModalOpen && (
                            <Modal isOpen title="Ajukan Peminjaman" onClose={closeCreateModal}>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Pilih User</Label>
                                        <Select
                                            value={createForm.data.user_id}
                                            onValueChange={(value) => createForm.setData('user_id', value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="-- Pilih User --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {createForm.errors.user_id && <p className="text-sm text-red-600">{createForm.errors.user_id}</p>}
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Pilih Aset</Label>
                                        <Select
                                            value={createForm.data.asset_id}
                                            onValueChange={(value) => createForm.setData('asset_id', value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="-- Pilih Aset --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assets.map((asset) => (
                                                    <SelectItem key={asset.id} value={String(asset.id)}>{asset.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {createForm.errors.asset_id && <p className="text-sm text-red-600">{createForm.errors.asset_id}</p>}
                                    </div>

                                    <div>
                                        <DatePicker
                                            label="Tanggal Pinjam"
                                            value={createForm.data.borrow_date}
                                            defaultValue={today}
                                            onChange={(value) => createForm.setData('borrow_date', value)}
                                        />
                                        {createForm.errors.borrow_date && <p className="text-sm text-red-600">{createForm.errors.borrow_date}</p>}
                                    </div>

                                    <div>
                                        <DatePicker
                                            label="Tanggal Kembali"
                                            value={createForm.data.return_date}
                                            onChange={(value) => createForm.setData('return_date', value)}
                                        />
                                        {createForm.errors.return_date && <p className="text-sm text-red-600">{createForm.errors.return_date}</p>}
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={closeCreateModal}>Batal</Button>
                                        <Button onClick={submitBorrowing} disabled={!isFormValid()}>Simpan</Button>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Peminjaman ({borrowings.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-3 text-left font-semibold">Peminjam</th>
                                        <th className="px-4 py-3 text-left font-semibold">Aset</th>
                                        <th className="px-4 py-3 text-left font-semibold">Tgl. Pinjam</th>
                                        <th className="px-4 py-3 text-left font-semibold">Tgl. Kembali</th>
                                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {borrowings.data.map((b: Borrowing) => (
                                        <tr key={b.id} className="border-b border-border transition-colors hover:bg-muted/50">
                                            <td className="px-4 py-3">{b.user.name}</td>
                                            <td className="px-4 py-3">{b.asset.name}</td>
                                            <td className="px-4 py-3 text-sm">{b.borrow_date}</td>
                                            <td className="px-4 py-3 text-sm">{b.return_date ?? '-'}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        b.status.name === 'Menunggu' ? 'warning' :
                                                        b.status.name === 'Disetujui' ? 'success' :
                                                        b.status.name === 'Dikembalikan' ? 'secondary' : 'destructive'
                                                    }
                                                >
                                                    {b.status.name}
                                                </Badge>
                                            </td>
                                            <td className="flex flex-wrap gap-2 py-2">
                                                <Button size="icon" variant="ghost" onClick={() => setSelected(b)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {b.status.name === 'Menunggu' && (
                                                    <>
                                                        <Button size="sm" onClick={() => setApproveTarget(b)}>
                                                            <CheckCircle className="mr-1 h-4 w-4" />Setujui
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => setRejectTarget(b)}>
                                                            <XCircle className="mr-1 h-4 w-4" />Tolak
                                                        </Button>
                                                    </>
                                                )}
                                                {b.status.name === 'Disetujui' && (
                                                    <Button size="sm" variant="outline" onClick={() => setReturnTarget(b)}>
                                                        Konfirmasi Pengembalian
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination currentPage={borrowings.current_page} totalPages={borrowings.last_page} onPageChange={(page) => apply({ page })} />
                    </CardContent>
                </Card>

                {selected && (
                    <Modal isOpen title="Detail Peminjaman" onClose={() => setSelected(null)}>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Nama Peminjam</Label>
                                <p>{selected.user.name}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Nama Aset</Label>
                                <p>{selected.asset.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Tanggal Pinjam</Label>
                                    <p>{selected.borrow_date}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Tanggal Kembali</Label>
                                    <p>{selected.return_date}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                <Badge
                                    variant={selected.status.name === 'Menunggu' ? 'warning' : selected.status.name === 'Disetujui' ? 'success' : 'destructive'}
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

                {alert && <AlertToast type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
            </div>
        </AppLayout>
    );
}
