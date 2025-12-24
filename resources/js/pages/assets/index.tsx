import { Head, router, usePage } from '@inertiajs/react';
import {
    ChevronsUpDown,
    Download,
    Edit2,
    FileText,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

import AlertToast from '@/components/common/alert-toast';
import DoubleConfirmationModal from '@/components/common/double-confirmation-modal';
import Modal from '@/components/common/modal';
import Pagination from '@/components/common/pagination';
import AssetForm from '@/components/forms/asset-form';
import AppLayout from '@/layouts/app-layout';

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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Aset', href: '/assets' }];

export default function Assets() {
    const { assets, filters, categories, auth, assetStatuses } = usePage()
        .props as any;
    const permissions: string[] = auth.permissions ?? [];

    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ?? '');
    const [statusId, setStatusId] = useState(filters.status_id ?? '');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<AssetItem | null>(null);
    const [alert, setAlert] = useState<any>(null);

    const applyFilter = (params: any = {}) => {
        router.get(
            '/assets',
            { search, category_id: categoryId, status_id: statusId, ...params },
            { preserveState: true, replace: true },
        );
    };

    const handleSubmit = (data: any) => {
        if (editingAsset) {
            router.put(`/assets/${editingAsset.id}`, data, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingAsset(null);
                    setAlert({
                        type: 'success',
                        message: 'Aset berhasil diperbarui',
                    });
                },
                onError: () => {
                    setAlert({
                        type: 'error',
                        message: 'Gagal memperbarui aset',
                    });
                },
            });
        } else {
            router.post('/assets', data, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setAlert({
                        type: 'success',
                        message: 'Aset berhasil ditambahkan',
                    });
                },
                onError: () => {
                    setAlert({
                        type: 'error',
                        message: 'Gagal menambahkan aset',
                    });
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deleteConfirm) return;
        router.delete(`/assets/${deleteConfirm.id}`, {
            onSuccess: () => {
                setDeleteConfirm(null);
                setAlert({
                    type: 'success',
                    message: 'Aset berhasil dihapus',
                });
            },
            onError: () => {
                setAlert({
                    type: 'error',
                    message: 'Gagal menghapus aset',
                });
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
                        <Label>Data Aset</Label>
                        <Input
                            placeholder="Cari nama aset..."
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                >
                                    {categoryId
                                        ? categories.find(
                                              (c: any) => c.id === categoryId,
                                          )?.name
                                        : 'Semua Kategori'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandEmpty>
                                        Kategori tidak ditemukan
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {categories.map((c: any) => (
                                            <CommandItem
                                                key={c.id}
                                                onSelect={() => {
                                                    setCategoryId(c.id);
                                                    applyFilter({
                                                        category_id: c.id,
                                                        page: 1,
                                                    });
                                                }}
                                            >
                                                {c.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="justify-between"
                                >
                                    {statusId
                                        ? assetStatuses.find(
                                              (s: any) => s.id === statusId,
                                          )?.name
                                        : 'Semua Status'}
                                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0">
                                <Command>
                                    <CommandGroup>
                                        {assetStatuses.map((s: any) => (
                                            <CommandItem
                                                key={s.id}
                                                onSelect={() => {
                                                    setStatusId(s.id);
                                                    applyFilter({
                                                        status_id: s.id,
                                                        page: 1,
                                                    });
                                                }}
                                            >
                                                {s.name}
                                            </CommandItem>
                                        ))}
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

                        {can(permissions, 'manage users') && (
                            <>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() =>
                                        window.open(
                                            '/assets/export/pdf',
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
                                            '/assets/export/excel')
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
                                        <th className="px-4 py-3 font-semibold text-foreground">
                                            Gambar
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-foreground">
                                            Nama Aset
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-foreground">
                                            Kategori
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-foreground">
                                            Kondisi
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-foreground">
                                            Status
                                        </th>
                                        {can(permissions, 'manage assets') && (
                                            <th className="px-4 py-3 font-semibold text-foreground">
                                                Aksi
                                            </th>
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
                                                    src={asset.image}
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
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    {can(
                                                        permissions,
                                                        'manage users',
                                                    ) && (
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
                                                    )}
                                                    {can(
                                                        permissions,
                                                        'manage assets',
                                                    ) && (
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
                                                    )}
                                                </div>
                                            </td>
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
                        initialData={editingAsset ?? undefined} // <- penting
                        onSubmit={handleSubmit}
                        onSuccess={() => setIsModalOpen(false)} // tutup modal setelah sukses
                        onError={(err) => console.log(err)} // debug error
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
