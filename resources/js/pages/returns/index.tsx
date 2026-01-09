import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Download, FileText } from 'lucide-react';
import { useState } from 'react';

import AlertToast from '@/components/common/alert-toast';
import DoubleConfirmationModal from '@/components/common/double-confirmation-modal';
import Modal from '@/components/common/modal';
import Pagination from '@/components/common/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useInertiaFilter } from '@/hooks/use-inertia-filter';
import AppLayout from '@/layouts/app-layout';
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
    type: 'asset' | 'borrowing';
}

interface Borrowing {
    id: number;
    borrow_date: string;
    return_date: string;
    status: Status;
    user: User;
    asset: Asset;
}

interface AssetReturn {
    id: number;
    return_date_actual: string;
    asset_condition: 'Baik' | 'Rusak' | 'Perbaikan';
    note?: string;
    borrowing: Borrowing;
}

interface Filter {
    search: string;
    status: string;
    page?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengembalian', href: '/returns' },
];

export default function Returns() {
    const { returns, borrowingStatuses, auth, pendingReturnCount } = usePage()
        .props as any;
    const permissions = auth.permissions;

    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<AssetReturn | null>(null);
    const createForm = useForm({
        asset_condition: '',
        note: '',
    });

    const [returnConfirm, setReturnConfirm] = useState<AssetReturn | null>(
        null,
    );

    console.log('halo');

    const {
        filters: filterState,
        setFilters,
        apply,
    } = useInertiaFilter<Filter>('/returns', {
        search: '',
        status: 'semua',
    });

    const handleSubmitReturn = () => {
        if (!selectedItem) {
            setAlert({
                type: 'error',
                message:
                    'Tidak ada item yang dipilih, silahkan pilih item terlebih dahulu.',
            });
            return;
        }

        if (!createForm.data.asset_condition) {
            setAlert({
                type: 'error',
                message: 'Silahkan pilih kondisi aset.',
            });
            return;
        }

        router.patch(
            `/returns/${selectedItem.id}/return`,
            {
                asset_condition: createForm.data.asset_condition,
                note: createForm.data.note,
            },
            {
                onSuccess: () => {
                    setAlert({
                        type: 'success',
                        message: `Pengembalian aset "${selectedItem?.borrowing.asset.name}" berhasil dikonfirmasi!`,
                    });
                    setReturnConfirm(null);
                    setIsModalOpen(false);
                },
                onError: () => {
                    setAlert({
                        type: 'error',
                        message: 'Terjadi kesalahan pada form',
                    });
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Pengembalian Aset" />

            <div className="space-y-6 p-6">
                {permissions.includes('manage users') &&
                    pendingReturnCount > 0 && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                            Ada {pendingReturnCount} aset yang belum
                            dikembalikan dan menunggu konfirmasi.
                        </div>
                    )}

                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div className="max-w-md flex-1">
                        <Label htmlFor="search">Cari Pengembalian</Label>
                        <Input
                            id="search"
                            placeholder="Cari peminjam atau aset..."
                            value={filterState.search}
                            onChange={(e) =>
                                setFilters({
                                    ...filterState,
                                    search: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="sr-only">Status</Label>
                        <div className="flex gap-2">
                            <Select
                                value={filterState.status}
                                onValueChange={(value) =>
                                    setFilters({
                                        ...filterState,
                                        status:
                                            value === 'semua'
                                                ? ''
                                                : value.toLowerCase(),
                                    })
                                }
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value="semua"
                                        disabled={
                                            filterState.status === 'semua'
                                        }
                                    >
                                        Semua Status
                                    </SelectItem>
                                    {borrowingStatuses.map((s: Status) => (
                                        <SelectItem
                                            key={s.id}
                                            value={s.name.toLowerCase()}
                                            disabled={
                                                filterState.status ===
                                                s.name.toLowerCase()
                                            }
                                        >
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {permissions.includes('manage users') && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="gap-2 bg-transparent"
                                        onClick={() =>
                                            window.open(
                                                '/returns/export/pdf',
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
                                                '/returns/export/excel')
                                        }
                                    >
                                        <FileText className="h-4 w-4" />
                                        Excel
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Riwayat Pengembalian ({returns.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left">
                                            Peminjam
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Aset
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Tgl Pinjam
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Tgl Kembali
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Status
                                        </th>
                                        {permissions.includes(
                                            'manage users',
                                        ) && (
                                            <th className="px-4 py-3 text-left">
                                                Aksi
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {returns.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                Tidak ada data pengembalian
                                            </td>
                                        </tr>
                                    ) : (
                                        returns.data.map((r: AssetReturn) => (
                                            <tr
                                                key={r.id}
                                                className="border-b hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3">
                                                    {r.borrowing.user.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {r.borrowing.asset.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {r.borrowing.borrow_date}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {r.return_date_actual}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={
                                                            r.borrowing.status
                                                                .name ===
                                                            'Dikembalikan'
                                                                ? 'success'
                                                                : r.borrowing
                                                                        .status
                                                                        .name ===
                                                                    'Menunggu Pengembalian'
                                                                  ? 'warning'
                                                                  : 'default'
                                                        }
                                                    >
                                                        {!permissions.includes(
                                                            'manage users',
                                                        ) &&
                                                        r.borrowing.status
                                                            .name ===
                                                            'Menunggu Pengembalian'
                                                            ? 'Menunggu Konfirmasi'
                                                            : r.borrowing.status
                                                                  .name}
                                                    </Badge>
                                                </td>

                                                {permissions.includes(
                                                    'manage users',
                                                ) &&
                                                    r.borrowing.status.name ===
                                                        'Menunggu Pengembalian' && (
                                                        <td className="px-4 py-3">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedItem(
                                                                        r,
                                                                    );
                                                                    setIsModalOpen(
                                                                        true,
                                                                    );
                                                                }}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                                Konfirmasi
                                                            </Button>
                                                        </td>
                                                    )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={returns.current_page}
                            totalPages={returns.last_page}
                            onPageChange={(page) => apply({ page })}
                        />
                    </CardContent>
                </Card>

                {selectedItem && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Konfirmasi Pengembalian Aset"
                    >
                        <div className="space-y-4">
                            <div className="rounded-lg border border-secondary bg-secondary/30 p-4">
                                <p className="text-sm text-muted-foreground">
                                    Aset yang dikembalikan:
                                </p>
                                <p className="text-lg font-semibold">
                                    {selectedItem.borrowing.asset.name}
                                </p>
                            </div>
                            <div>
                                <Label>Kondisi Aset</Label>
                                <Select
                                    value={createForm.data.asset_condition}
                                    onValueChange={(value) =>
                                        createForm.setData(
                                            'asset_condition',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih kondisi aset" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Baik">
                                            Baik
                                        </SelectItem>
                                        <SelectItem value="Rusak">
                                            Rusak
                                        </SelectItem>
                                        <SelectItem value="Perbaikan">
                                            Perbaikan
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Catatan</Label>
                                <textarea
                                    value={createForm.data.note}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'note',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded border px-3 py-2"
                                    placeholder="Masukkan catatan (opsional)"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleSubmitReturn}
                                    disabled={!createForm.data.asset_condition}
                                >
                                    Konfirmasi
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

                <DoubleConfirmationModal
                    isOpen={returnConfirm !== null}
                    title="Konfirmasi Pengembalian Aset"
                    message={`Apakah Anda yakin ingin mengkonfirmasi pengembalian "${returnConfirm?.borrowing.asset.name}" dengan kondisi yang telah dipilih?`}
                    confirmText="Konfirmasi"
                    onConfirm={handleSubmitReturn}
                    onCancel={() => setReturnConfirm(null)}
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
