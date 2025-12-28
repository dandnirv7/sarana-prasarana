import { Head, router, usePage } from '@inertiajs/react';
import { Download, Edit, Eye, FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import AlertToast from '@/components/common/alert-toast';
import DoubleConfirmationModal from '@/components/common/double-confirmation-modal';
import Modal from '@/components/common/modal';
import Pagination from '@/components/common/pagination';

import UserForm from '@/components/forms/user-form';
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

type UserItem = {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Staff';
    status: 'Aktif' | 'Tidak Aktif';
    department: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengguna',
        href: '/users',
    },
];

export default function Users() {
    const { users, auth, departments, roles } = usePage().props as any;
    const permissions: string[] = auth.permissions ?? [];

    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<UserItem | null>(null);
    console.log(selectedUser);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isNewUserOpen, setIsNewUserOpen] = useState(false);

    const [alert, setAlert] = useState<any>(null);

    const {
        filters: filterState,
        setFilters,
        apply,
    } = useInertiaFilter('/users', {
        search: '',
        role: '',
    });

    const handleEditOpen = (user: UserItem) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteConfirm) return;

        router.delete(`/users/${deleteConfirm.id}`, {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const roleVariant = (role: string) => {
        if (role === 'Admin') return 'destructive';
        if (role === 'Manager') return 'default';
        return 'secondary';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengguna" />
            <div className="mx-6 space-y-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div className="max-w-md flex-1">
                        <Label>Cari Pengguna</Label>
                        <Input
                            value={filterState.search}
                            placeholder="Cari berdasarkan nama atau email..."
                            onChange={(e) =>
                                setFilters({
                                    ...filterState,
                                    search: e.target.value,
                                })
                            }
                            className="mt-1"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="status" className="sr-only">
                            Status
                        </Label>
                        <div className="flex gap-2">
                            <Select
                                value={filterState.role}
                                onValueChange={(value) => {
                                    setFilters({
                                        ...filterState,
                                        role: value,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Semua Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Role
                                    </SelectItem>
                                    {roles.map(
                                        (role: {
                                            id: number;
                                            name: string;
                                        }) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.name.toLowerCase()}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>

                            {permissions.includes('manage users') && (
                                <Button
                                    onClick={() => setIsNewUserOpen(true)}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah User
                                </Button>
                            )}

                            {permissions.includes('manage users') && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="gap-2 bg-transparent"
                                        onClick={() =>
                                            window.open(
                                                '/users/export/pdf',
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
                                                '/users/export/excel')
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
                        <CardTitle>Daftar Pengguna ({users.total})</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left">
                                            Nama
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((item: UserItem) => (
                                        <tr
                                            key={item.id}
                                            className="border-b hover:bg-muted/50"
                                        >
                                            <td className="px-4 py-3">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {item.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={roleVariant(
                                                        item.role,
                                                    )}
                                                >
                                                    {item.role.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        item.status === 'Aktif'
                                                            ? 'success'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(
                                                                item,
                                                            );
                                                            setIsDetailOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="rounded p-2 text-primary hover:bg-primary/10"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>

                                                    {permissions.includes(
                                                        'manage users',
                                                    ) && (
                                                        <button
                                                            onClick={() =>
                                                                handleEditOpen(
                                                                    item,
                                                                )
                                                            }
                                                            className="rounded p-2 text-blue-600 hover:bg-blue-500/10"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                    {permissions.includes(
                                                        'manage users',
                                                    ) && (
                                                        <button
                                                            onClick={() =>
                                                                setDeleteConfirm(
                                                                    item,
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
                        </div>

                        {users.data.length === 0 && (
                            <p className="py-8 text-center text-muted-foreground">
                                Tidak ada data pengguna
                            </p>
                        )}

                        <Pagination
                            currentPage={users.current_page}
                            totalPages={users.last_page}
                            onPageChange={(page) => apply({ page })}
                        />
                    </CardContent>
                </Card>

                {selectedUser && (
                    <Modal
                        isOpen={isDetailOpen}
                        onClose={() => setIsDetailOpen(false)}
                        title="Detail Pengguna"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Nama
                                </label>
                                <p className="text-base font-medium">
                                    {selectedUser.name}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Email
                                </label>
                                <p className="text-base font-medium">
                                    {selectedUser.email}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Role
                                    </label>
                                    <Badge
                                        variant={roleVariant(selectedUser.role)}
                                    >
                                        {selectedUser.role.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Status
                                    </label>
                                    <Badge
                                        variant={
                                            selectedUser.status === 'Aktif'
                                                ? 'success'
                                                : 'secondary'
                                        }
                                    >
                                        {selectedUser.status}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Department
                                </label>
                                <p className="text-base font-medium">
                                    {selectedUser.department}
                                </p>
                            </div>
                        </div>
                    </Modal>
                )}

                {selectedUser && (
                    <Modal
                        isOpen={isEditOpen}
                        onClose={() => setIsEditOpen(false)}
                        title="Edit Pengguna"
                    >
                        <UserForm
                            roles={roles}
                            departments={departments}
                            initialData={{
                                id: selectedUser.id,
                                name: selectedUser.name,
                                email: selectedUser.email,
                                role: selectedUser.role,
                                department: selectedUser.department,
                            }}
                            onSuccess={() => {
                                setIsEditOpen(false);
                                setSelectedUser(null);
                            }}
                            onError={(err) =>
                                setAlert({
                                    type: 'error',
                                    message: Object.values(err).join(', '),
                                })
                            }
                        />
                    </Modal>
                )}

                <Modal
                    isOpen={isNewUserOpen}
                    onClose={() => setIsNewUserOpen(false)}
                    title="Tambah Pengguna Baru"
                >
                    <UserForm
                        roles={roles}
                        departments={departments}
                        onSuccess={() => setIsNewUserOpen(false)}
                        onError={(err) =>
                            setAlert({
                                type: 'error',
                                message: Object.values(err).join(', '),
                            })
                        }
                    />
                </Modal>

                <DoubleConfirmationModal
                    isOpen={!!deleteConfirm}
                    title="Hapus Pengguna"
                    message={`Apakah Anda yakin ingin menghapus pengguna "${deleteConfirm?.name}"?`}
                    confirmText="Hapus"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                />

                {alert && (
                    <AlertToast {...alert} onClose={() => setAlert(null)} />
                )}
            </div>
        </AppLayout>
    );
}
