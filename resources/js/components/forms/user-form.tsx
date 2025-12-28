import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface Department {
    value: string;
    label: string;
}

interface UserFormProps {
    roles: Role[];
    departments: Department[];
    initialData?: {
        id?: number;
        name: string;
        email: string;
        role: string;
        department: string;
    };
    onSuccess?: (message?: string) => void;
    onError?: (errors?: any) => void;
}

export default function UserForm({
    roles,
    departments,
    initialData,
    onSuccess,
    onError,
}: UserFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name ?? '',
        email: initialData?.email ?? '',
        password: '',
        role: initialData?.role ?? '',
        department: initialData?.department ?? '',
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: any = {};
        if (!formData.name) newErrors.name = 'Nama wajib diisi';
        if (!formData.email) newErrors.email = 'Email wajib diisi';
        if (!initialData && !formData.password)
            newErrors.password = 'Password wajib diisi';
        if (!formData.role) newErrors.role = 'Role wajib dipilih';
        if (!formData.department)
            newErrors.department = 'Department wajib dipilih';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);
        setErrors({});

        const url = initialData?.id ? `/users/${initialData.id}` : '/users';

        const data: any = {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            department: formData.department,
        };

        if (!initialData) data.password = formData.password;
        if (initialData) data._method = 'PUT';

        router.post(url, data, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                onSuccess?.(
                    initialData
                        ? 'Pengguna berhasil diperbarui'
                        : 'Pengguna berhasil ditambahkan',
                );
            },
            onError: (err) => {
                setProcessing(false);
                setErrors(err);
                onError?.(err);
            },
        });

        console.log(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Nama</Label>
                <Input
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                )}
            </div>

            <div>
                <Label>Email</Label>
                <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                />
                {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                )}
            </div>

            {!initialData && (
                <div>
                    <Label>Password</Label>
                    <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                password: e.target.value,
                            })
                        }
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500">
                            {errors.password}
                        </p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Role</Label>
                    <Select
                        value={formData.role}
                        onValueChange={(val) =>
                            setFormData({ ...formData, role: val })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((r) => (
                                <SelectItem key={r.id} value={r.name}>
                                    {r.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.role && (
                        <p className="text-sm text-red-500">{errors.role}</p>
                    )}
                </div>

                <div>
                    <Label>Department</Label>
                    <Select
                        value={formData.department}
                        onValueChange={(val) =>
                            setFormData({ ...formData, department: val })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((d) => (
                                <SelectItem key={d.value} value={d.value}>
                                    {d.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.department && (
                        <p className="text-sm text-red-500">
                            {errors.department}
                        </p>
                    )}
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
                {initialData ? 'Update Pengguna' : 'Tambah Pengguna'}
            </Button>
        </form>
    );
}
