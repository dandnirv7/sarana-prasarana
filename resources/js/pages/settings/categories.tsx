import AlertToast from '@/components/common/alert-toast';
import DoubleConfirmationModal from '@/components/common/double-confirmation-modal';
import Modal from '@/components/common/modal';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Category {
    assets_count: number;
    created_at: string;
    description: string;
    id: number;
    name: string;
    updated_at: string;
}

const breadcrumbs = [
    { title: 'Pengaturan', href: '/settings' },
    { title: 'Kategori Aset', href: '/settings/categories' },
];

const CategoryList = ({ categories }: { categories: Category[] }) => {
    const [categoryModal, setCategoryModal] = useState<{
        open: boolean;
        mode: 'add' | 'edit';
        data: Category | null;
    }>({ open: false, mode: 'add', data: null });

    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const { data, setData, reset } = useForm({
        name: '',
        description: '',
    });

    const openModal = (
        mode: 'add' | 'edit',
        category: Category | null = null,
    ) => {
        setCategoryModal({ open: true, mode, data: category });
        setData({
            name: category?.name || '',
            description: category?.description || '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (categoryModal.mode === 'add') {
            router.post('/categories', data, {
                onSuccess: () => {
                    setCategoryModal({ ...categoryModal, open: false });
                    reset();
                    setAlert({
                        type: 'success',
                        message: 'Kategori berhasil ditambahkan!',
                    });
                },
                onError: () => {
                    setAlert({
                        type: 'error',
                        message: 'Terjadi kesalahan saat menambahkan kategori.',
                    });
                },
            });
        } else if (categoryModal.mode === 'edit' && categoryModal.data) {
            router.put(`/categories/${categoryModal.data.id}`, data, {
                onSuccess: () => {
                    setCategoryModal({ ...categoryModal, open: false });
                    reset();
                    setAlert({
                        type: 'success',
                        message: 'Kategori berhasil diperbarui!',
                    });
                },
                onError: () => {
                    setAlert({
                        type: 'error',
                        message: 'Terjadi kesalahan saat memperbarui kategori.',
                    });
                },
            });
        }
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;

        router.delete(`/categories/${deleteTarget.id}`, {
            onSuccess: () => {
                setDeleteTarget(null);
                setAlert({
                    type: 'success',
                    message: 'Kategori berhasil dihapus!',
                });
            },
            onError: () => {
                setDeleteTarget(null);
                setAlert({
                    type: 'error',
                    message: 'Terjadi kesalahan saat menghapus kategori.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Aset" />
            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Kategori Aset</CardTitle>
                            <CardDescription>
                                Kelola kategori untuk klasifikasi aset
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => openModal('add')}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Kategori
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div>
                                        <div className="font-semibold">
                                            {cat.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {cat.description}
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            {cat.assets_count} aset terdaftar
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="bg-transparent text-blue-400 hover:bg-blue-100 hover:text-blue-500"
                                            onClick={() =>
                                                openModal('edit', cat)
                                            }
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="bg-transparent text-red-400 hover:bg-red-100 hover:text-red-500"
                                            size="icon"
                                            onClick={() => setDeleteTarget(cat)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                {categoryModal.open && (
                    <Modal
                        isOpen
                        title="Ajukan Peminjaman"
                        onClose={() =>
                            setCategoryModal({ ...categoryModal, open: false })
                        }
                    >
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Nama</Label>
                                <Input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-base text-muted-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div>
                                <Label>Deskripsi</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-base text-muted-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setCategoryModal({
                                            ...categoryModal,
                                            open: false,
                                        })
                                    }
                                >
                                    Batal
                                </Button>
                                <Button type="submit">Simpan</Button>
                            </div>
                        </form>
                    </Modal>
                )}
                {deleteTarget && (
                    <DoubleConfirmationModal
                        isOpen={!!deleteTarget}
                        title="Hapus Kategori"
                        message={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget.name}"?`}
                        confirmText="Hapus"
                        onConfirm={confirmDelete}
                        onCancel={() => setDeleteTarget(null)}
                    />
                )}
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
};

export default CategoryList;
