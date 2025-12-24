'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { router, usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Status {
    id: number;
    name: string;
}

interface PageProps {
    categories: Category[];
    assetStatuses: Status[];
    [key: string]: any;
}

interface AssetFormProps {
    initialData?: {
        id?: number;
        name: string;
        category_id: number;
        condition: string;
        status_id: number;
        image_path?: string | null;
    };
    onSubmit?: (data: any) => void;
    onSuccess?: (message?: string) => void;
    onError?: (errors?: any) => void;
}

export default function AssetForm({
    initialData,
    onSubmit,
    onSuccess,
    onError,
}: AssetFormProps) {
    const { categories, assetStatuses } = usePage<PageProps>().props;

    const [formData, setFormData] = useState({
        name: initialData?.name ?? '',
        category_id: initialData?.category_id ?? 0,
        condition: initialData?.condition ?? '',
        status_id: initialData?.status_id ?? 0,
        image_path: null as File | null,
    });

    const [preview, setPreview] = useState(initialData?.image_path ?? '');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (formData.image_path instanceof File) {
            const url = URL.createObjectURL(formData.image_path);
            setPreview(url);

            return () => URL.revokeObjectURL(url);
        }
    }, [formData.image_path]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: any = {};
        if (!formData.name) newErrors.name = 'Nama aset wajib diisi';
        if (!formData.category_id)
            newErrors.category_id = 'Kategori wajib diisi';
        if (!formData.condition) newErrors.condition = 'Kondisi wajib diisi';
        if (!formData.status_id) newErrors.status_id = 'Status wajib diisi';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);
        setErrors({});

        const url = initialData?.id ? `/assets/${initialData.id}` : '/assets';

        const data = new FormData();
        data.append('name', formData.name);
        data.append('category_id', formData.category_id.toString());
        data.append('condition', formData.condition);
        data.append('status_id', formData.status_id.toString());
        if (formData.image_path instanceof File) {
            data.append('image_path', formData.image_path);
        }

        if (initialData?.id) data.append('_method', 'PUT');

        router.post(url, data, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                if (onSuccess)
                    onSuccess(
                        initialData?.id
                            ? 'Aset berhasil diperbarui'
                            : 'Aset berhasil ditambahkan',
                    );
            },
            onError: (err) => {
                setProcessing(false);
                setErrors(err);
                if (onError) onError(err);
            },
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
            encType="multipart/form-data"
        >
            <div>
                <Label>Nama Aset</Label>
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
                <Label>Kategori</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-between"
                        >
                            {categories.find(
                                (c) => c.id === formData.category_id,
                            )?.name ?? 'Pilih kategori'}
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <Command>
                            <CommandGroup>
                                {categories.map((c) => (
                                    <CommandItem
                                        key={c.id}
                                        onSelect={() =>
                                            setFormData({
                                                ...formData,
                                                category_id: c.id,
                                            })
                                        }
                                    >
                                        {c.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
                {errors.category_id && (
                    <p className="text-sm text-red-500">{errors.category_id}</p>
                )}
            </div>

            <div>
                <Label>Kondisi</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-between"
                        >
                            {formData.condition || 'Pilih kondisi'}
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <Command>
                            <CommandGroup>
                                {[
                                    'Baik',
                                    'Rusak',
                                    'Rusak Ringan',
                                    'Rusak Berat',
                                    'Perbaikan',
                                    'Belum Diperbaiki',
                                    'Belum Dikembalikan',
                                ].map((s) => (
                                    <CommandItem
                                        key={s}
                                        onSelect={() =>
                                            setFormData({
                                                ...formData,
                                                condition: s,
                                            })
                                        }
                                    >
                                        {s}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
                {errors.condition && (
                    <p className="text-sm text-red-500">{errors.condition}</p>
                )}
            </div>

            <div>
                <Label>Status</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-between"
                        >
                            {assetStatuses.find(
                                (s) => s.id === formData.status_id,
                            )?.name ?? 'Pilih status'}
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <Command>
                            <CommandGroup>
                                {assetStatuses.map((s) => (
                                    <CommandItem
                                        key={s.id}
                                        onSelect={() =>
                                            setFormData({
                                                ...formData,
                                                status_id: s.id,
                                            })
                                        }
                                    >
                                        {s.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
                {errors.status_id && (
                    <p className="text-sm text-red-500">{errors.status_id}</p>
                )}
            </div>

            <div>
                <Label>Gambar (opsional)</Label>
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            image_path: e.target.files?.[0] ?? null,
                        })
                    }
                />
                {preview && (
                    <img
                        src={preview}
                        alt="Preview"
                        className="mt-2 h-24 w-24 rounded object-cover"
                    />
                )}
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
                {initialData ? 'Update Aset' : 'Tambah Aset'}
            </Button>
        </form>
    );
}
