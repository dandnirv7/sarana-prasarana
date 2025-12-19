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
import { can } from '@/lib/permission';

import { ChevronsUpDown } from 'lucide-react';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';

type UserItem = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'staff';
    status: 'Active' | 'Inactive';
    department: string;
};

const roles = [
    { value: '', label: 'Semua Role' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'staff', label: 'Staff' },
];

const statuses = [
    { value: '', label: 'Semua Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengguna',
        href: '/users',
    },
];

export default function Users() {
    const { users, filters, auth, departments } = usePage().props as any;
    const permissions: string[] = auth.permissions ?? [];

    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<UserItem | null>(null);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isNewUserOpen, setIsNewUserOpen] = useState(false);

    const [editFormData, setEditFormData] = useState<Partial<UserItem>>({});
    const [newUserData, setNewUserData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        status: 'Active',
        department: '',
    });

    const [alert, setAlert] = useState<any>(null);

    const applyFilter = (params: any = {}) => {
        router.get(
            '/users',
            {
                search,
                role,
                status,
                ...params,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleCreate = () => {
        router.post('/users', newUserData, {
            onSuccess: () => {
                setIsNewUserOpen(false);
                setNewUserData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'staff',
                    status: 'Active',
                    department: '',
                });
            },
            onError: (errors) => {
                console.error(errors);
                setAlert({
                    type: 'error',
                    message: Object.values(errors).join(', '),
                });
            },
        });
    };

    const handleEditOpen = (user: UserItem) => {
        setSelectedUser(user);
        setEditFormData(user);
        setIsEditOpen(true);
    };

    const handleUpdate = () => {
        if (!selectedUser) return;

        router.put(`/users/${selectedUser.id}`, editFormData, {
            onSuccess: () => setIsEditOpen(false),
        });
    };

    const confirmDelete = () => {
        if (!deleteConfirm) return;

        router.delete(`/users/${deleteConfirm.id}`, {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const roleVariant = (role: string) => {
        if (role === 'admin') return 'destructive';
        if (role === 'manager') return 'default';
        return 'secondary';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengguna" />
            <div className="mx-6 space-y-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="max-w-md flex-1">
                        <Label>Cari Pengguna</Label>
                        <Input
                            value={search}
                            placeholder="Cari berdasarkan nama atau email..."
                            onChange={(e) => {
                                setSearch(e.target.value);
                                applyFilter({
                                    search: e.target.value,
                                    page: 1,
                                });
                            }}
                            className="mt-1"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-[200px] justify-between"
                                >
                                    {roles.find((r) => r.value === role)
                                        ?.label ?? 'Semua Role'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                    <CommandEmpty>
                                        Role tidak ditemukan
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {roles.map((r) => (
                                            <CommandItem
                                                key={r.value}
                                                value={r.value}
                                                onSelect={() => {
                                                    setRole(r.value);
                                                    applyFilter({
                                                        role: r.value,
                                                        page: 1,
                                                    });
                                                }}
                                            >
                                                {r.label}
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
                                    role="combobox"
                                    className="w-[200px] justify-between"
                                >
                                    {statuses.find((s) => s.value === status)
                                        ?.label ?? 'Semua Status'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                    <CommandEmpty>
                                        Status tidak ditemukan
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {statuses.map((s) => (
                                            <CommandItem
                                                key={s.value}
                                                value={s.value}
                                                onSelect={() => {
                                                    setStatus(s.value);
                                                    applyFilter({
                                                        status: s.value,
                                                        page: 1,
                                                    });
                                                }}
                                            >
                                                {s.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {can(permissions, 'manage users') && (
                            <Button
                                onClick={() => setIsNewUserOpen(true)}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah User
                            </Button>
                        )}

                        {can(permissions, 'manage users') && (
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
                                                        item.status === 'Active'
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

                                                    {can(
                                                        permissions,
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

                                                    {can(
                                                        permissions,
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
                            onPageChange={(page) => applyFilter({ page })}
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
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Role
                                    </label>
                                    <Badge
                                        variant={roleVariant(selectedUser.role)}
                                    >
                                        {selectedUser.role.toUpperCase()}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Status
                                    </label>
                                    <Badge
                                        variant={
                                            selectedUser.status === 'Active'
                                                ? 'success'
                                                : 'secondary'
                                        }
                                        className="mt-1"
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
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="editName">Nama</Label>
                                <Input
                                    id="editName"
                                    value={editFormData.name || ''}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            name: e.target.value,
                                        })
                                    }
                                    aria-label="Nama pengguna"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="editEmail">Email</Label>
                                <Input
                                    id="editEmail"
                                    type="email"
                                    value={editFormData.email || ''}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            email: e.target.value,
                                        })
                                    }
                                    aria-label="Email pengguna"
                                    className="mt-1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editRole">Role</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between"
                                            >
                                                {roles.find(
                                                    (r) =>
                                                        r.value ===
                                                        editFormData.role,
                                                )?.label ?? 'Pilih Role'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandEmpty>
                                                    Role tidak ditemukan
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {roles
                                                        .filter((r) => r.value)
                                                        .map((r) => (
                                                            <CommandItem
                                                                key={r.value}
                                                                value={r.value}
                                                                onSelect={() =>
                                                                    setEditFormData(
                                                                        {
                                                                            ...editFormData,
                                                                            role: r.value as any,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                {r.label}
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <Label htmlFor="editStatus">Status</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between"
                                            >
                                                {statuses.find(
                                                    (s) =>
                                                        s.value ===
                                                        editFormData.status,
                                                )?.label ?? 'Pilih Status'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandEmpty>
                                                    Status tidak ditemukan
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {statuses
                                                        .filter((s) => s.value)
                                                        .map((s) => (
                                                            <CommandItem
                                                                key={s.value}
                                                                value={s.value}
                                                                onSelect={() =>
                                                                    setEditFormData(
                                                                        {
                                                                            ...editFormData,
                                                                            status: s.value as any,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                {s.label}
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="editDepartment">
                                    Department
                                </Label>
                                <Input
                                    id="editDepartment"
                                    value={editFormData.department || ''}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            department: e.target.value,
                                        })
                                    }
                                    aria-label="Department pengguna"
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditOpen(false)}
                                    aria-label="Batal edit pengguna"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleUpdate}
                                    aria-label="Simpan perubahan pengguna"
                                >
                                    Simpan
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

                <Modal
                    isOpen={isNewUserOpen}
                    onClose={() => setIsNewUserOpen(false)}
                    title="Tambah Pengguna Baru"
                >
                    <div className="space-y-4">
                        <div>
                            <Label>Nama</Label>
                            <Input
                                placeholder="Nama pengguna"
                                value={newUserData.name}
                                onChange={(e) =>
                                    setNewUserData({
                                        ...newUserData,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="email@contoh.com"
                                value={newUserData.email}
                                onChange={(e) =>
                                    setNewUserData({
                                        ...newUserData,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label>Password</Label>
                            <Input
                                type="password"
                                placeholder="Password awal"
                                value={newUserData.password}
                                onChange={(e) =>
                                    setNewUserData({
                                        ...newUserData,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Role</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                'w-full justify-between',
                                                !newUserData.role &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            {roles.find(
                                                (r) =>
                                                    r.value ===
                                                    newUserData.role,
                                            )?.label ?? 'Pilih Role'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandEmpty>
                                                Role tidak ditemukan
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {roles
                                                    .filter((r) => r.value) // filter out empty option if needed
                                                    .map((r) => (
                                                        <CommandItem
                                                            key={r.value}
                                                            value={r.value}
                                                            onSelect={() =>
                                                                setNewUserData({
                                                                    ...newUserData,
                                                                    role: r.value,
                                                                })
                                                            }
                                                        >
                                                            {r.label}
                                                        </CommandItem>
                                                    ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                'w-full justify-between',
                                                !newUserData.status &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            {statuses.find(
                                                (s) =>
                                                    s.value ===
                                                    newUserData.status,
                                            )?.label ?? 'Pilih Status'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandEmpty>
                                                Status tidak ditemukan
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {statuses
                                                    .filter((s) => s.value)
                                                    .map((s) => (
                                                        <CommandItem
                                                            key={s.value}
                                                            value={s.value}
                                                            onSelect={() =>
                                                                setNewUserData({
                                                                    ...newUserData,
                                                                    status: s.value,
                                                                })
                                                            }
                                                        >
                                                            {s.label}
                                                        </CommandItem>
                                                    ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>Department</Label>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            'w-full justify-between',
                                            !newUserData.department &&
                                                'text-muted-foreground',
                                        )}
                                    >
                                        {newUserData.department
                                            ? departments.find(
                                                  (d: any) =>
                                                      d.value ===
                                                      newUserData.department,
                                              )?.label
                                            : 'Pilih Department'}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandEmpty>
                                            Department tidak ditemukan
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {departments.map((dept: any) => (
                                                <CommandItem
                                                    key={dept.value}
                                                    value={dept.value}
                                                    onSelect={() => {
                                                        setNewUserData({
                                                            ...newUserData,
                                                            department:
                                                                dept.value,
                                                        });
                                                    }}
                                                >
                                                    {dept.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsNewUserOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={
                                    !newUserData.name ||
                                    !newUserData.email ||
                                    !newUserData.password ||
                                    !newUserData.department ||
                                    !newUserData.role ||
                                    !newUserData.status
                                }
                            >
                                Simpan
                            </Button>
                        </div>
                    </div>
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
