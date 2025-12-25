'use client';

import { Head, router, usePage } from '@inertiajs/react';
import {
    ChevronsUpDown,
    Download,
    Edit2,
    FileText,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import AlertToast from '@/components/common/alert-toast';
import DoubleConfirmationModal from '@/components/common/double-confirmation-modal';
import Modal from '@/components/common/modal';
import Pagination from '@/components/common/pagination';
import AssetForm from '@/components/forms/asset-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/permission';
import { BreadcrumbItem } from '@/types';

type AssetItem = {
    id: number;
    name: string;
    category_id: number;
    category_name: string;
    condition: string;
    status_id: number;
    status_name: string;
    image?: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Aset', href: '/asset' }];

export default function Assets() {
    const { assets, filters, categories, assetStatuses, auth } = usePage()
        .props as any;
    const permissions: string[] = auth.permissions ?? [];

    const [search, setSearch] = useState(filters.search ?? '');
    const [kategori, setKategori] = useState(filters.kategori ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<AssetItem | null>(null);
    const [alert, setAlert] = useState<any>(null);

    const applyFilter = (
        params: {
            search?: string;
            kategori?: string;
            status?: string;
            page?: number;
        } = {},
    ) => {
        const queryParams: {
            search?: string;
            kategori?: string;
            status?: string;
            page?: number;
        } = {};

        if (search) queryParams.search = search;
        if (kategori) queryParams.kategori = kategori;
        if (status) queryParams.status = status;
        if (params.page) queryParams.page = params.page;

        router.get('/asset', queryParams, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        applyFilter({
            search,
            kategori,
            status,
        });
    }, [search, kategori, status]);

    const handleDelete = () => {
        if (!deleteConfirm) return;
        router.delete(`/asset/${deleteConfirm.id}`, {
            onSuccess: () => {
                setDeleteConfirm(null);
                setAlert({ type: 'success', message: 'Aset berhasil dihapus' });
            },
            onError: () => {
                setAlert({ type: 'error', message: 'Gagal menghapus aset' });
            },
        });
    };

    const handleEditOpen = (asset: AssetItem) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Aset" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-md flex-1">
                        <Label className="sr-only">Cari Aset</Label>
                        <Input
                            placeholder="Cari nama aset..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between capitalize"
                                >
                                    {kategori || 'Semua Kategori'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0">
                                <Command>
                                    <CommandEmpty>
                                        Kategori tidak ditemukan
                                    </CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => {
                                                setKategori('');
                                                applyFilter({
                                                    kategori: '',
                                                    page: 1,
                                                });
                                            }}
                                            disabled={!kategori}
                                        >
                                            Semua Kategori
                                        </CommandItem>

                                        {categories.map(
                                            (c: {
                                                id: number;
                                                name: string;
                                            }) => (
                                                <CommandItem
                                                    key={c.id}
                                                    onSelect={() => {
                                                        setKategori(
                                                            c.name.toLowerCase(),
                                                        );
                                                        applyFilter({
                                                            kategori:
                                                                c.name.toLowerCase(),
                                                            page: 1,
                                                        });
                                                    }}
                                                >
                                                    {c.name}
                                                </CommandItem>
                                            ),
                                        )}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="justify-between capitalize"
                                >
                                    {status || 'Semua Status'}
                                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0">
                                <Command>
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => {
                                                setStatus('');
                                                applyFilter({
                                                    status: '',
                                                    page: 1,
                                                });
                                            }}
                                            disabled={!status}
                                        >
                                            Semua Status
                                        </CommandItem>

                                        {assetStatuses.map(
                                            (s: {
                                                id: number;
                                                name: string;
                                            }) => (
                                                <CommandItem
                                                    key={s.id}
                                                    onSelect={() => {
                                                        setStatus(
                                                            s.name.toLowerCase(),
                                                        );
                                                        applyFilter({
                                                            status: s.name.toLowerCase(),
                                                            page: 1,
                                                        });
                                                    }}
                                                >
                                                    {s.name}
                                                </CommandItem>
                                            ),
                                        )}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {can(permissions, 'manage assets') && (
                            <Button
                                onClick={() => {
                                    setEditingAsset(null);
                                    setIsModalOpen(true);
                                }}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" /> Tambah Aset
                            </Button>
                        )}

                        {can(permissions, 'manage assets') && (
                            <>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() =>
                                        window.open(
                                            '/asset/export/pdf',
                                            '_blank',
                                        )
                                    }
                                >
                                    <Download className="h-4 w-4" /> PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() =>
                                        (window.location.href =
                                            '/asset/export/excel')
                                    }
                                >
                                    <FileText className="h-4 w-4" /> Excel
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Aset ({assets.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border text-left">
                                        <th className="px-4 py-3">Gambar</th>
                                        <th className="px-4 py-3">Nama Aset</th>
                                        <th className="px-4 py-3">Kategori</th>
                                        <th className="px-4 py-3">Kondisi</th>
                                        <th className="px-4 py-3">Status</th>
                                        {can(permissions, 'manage assets') && (
                                            <th className="px-4 py-3">Aksi</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.data.map((asset: AssetItem) => (
                                        <tr
                                            key={asset.id}
                                            className="border-b border-border hover:bg-muted/50"
                                        >
                                            <td className="px-4 py-3">
                                                <img
                                                    src={
                                                        asset.image ??
                                                        '/placeholder.svg'
                                                    }
                                                    className="h-12 w-12 rounded object-cover"
                                                    alt={asset.name}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                {asset.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {asset.category_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {asset.condition}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        asset.status_name ===
                                                        'Tersedia'
                                                            ? 'success'
                                                            : asset.status_name ===
                                                                'Dipinjam'
                                                              ? 'warning'
                                                              : 'destructive'
                                                    }
                                                >
                                                    {asset.status_name}
                                                </Badge>
                                            </td>
                                            {can(
                                                permissions,
                                                'manage assets',
                                            ) && (
                                                <td className="flex gap-2 px-4 py-3">
                                                    <button
                                                        onClick={() =>
                                                            handleEditOpen(
                                                                asset,
                                                            )
                                                        }
                                                        className="rounded p-2 text-blue-600 hover:bg-blue-500/10"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeleteConfirm(
                                                                asset,
                                                            )
                                                        }
                                                        className="rounded p-2 text-red-600 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {assets.data.length === 0 && (
                                <p className="py-8 text-center text-muted-foreground">
                                    Tidak ada data aset
                                </p>
                            )}

                            <Pagination
                                currentPage={assets.current_page}
                                totalPages={assets.last_page}
                                onPageChange={(page) => applyFilter({ page })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingAsset ? 'Edit Aset' : 'Tambah Aset'}
                >
                    <AssetForm
                        initialData={editingAsset ?? undefined}
                        onSuccess={() => setIsModalOpen(false)}
                        onError={(err) => console.log(err)}
                    />
                </Modal>

                <DoubleConfirmationModal
                    isOpen={!!deleteConfirm}
                    title="Hapus Aset"
                    message={`Yakin ingin menghapus aset "${deleteConfirm?.name}"?`}
                    confirmText="Hapus"
                    isDangerous
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirm(null)}
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
