'use client';

import { Button } from '@/components/ui/button';
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
import { router, usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface PageProps {
    categories: Category[];
    conditions: string[];
    [key: string]: any;
}

interface AssetFormProps {
    initialData?: {
        id?: number;
        name: string;
        category_id: number;
        condition: string;
        status: string;
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
    const { categories, conditions } = usePage<PageProps>().props;

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        category_id: initialData?.category_id || '',
        condition: initialData?.condition || '',
        status: initialData?.status || '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const statuses = ['Tersedia', 'Dipinjam', 'Rusak'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.category_id ||
            !formData.condition ||
            !formData.status
        ) {
            alert('Semua field harus diisi');
            return;
        }

        if (onSubmit) {
            onSubmit(formData);
            return;
        }

        setProcessing(true);
        setErrors({});

        const url = initialData?.id ? `/assets/${initialData.id}` : '/assets';
        const method = initialData?.id ? 'put' : 'post';

        router[method](url, formData, {
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
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Aset */}
            <div className="space-y-2">
                <Label htmlFor="nama">Nama Aset</Label>
                <Input
                    id="nama"
                    placeholder="Masukkan nama aset"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-muted"
                />
                {errors.nama && (
                    <span className="text-sm text-destructive">
                        {errors.nama}
                    </span>
                )}
            </div>

            {/* Kategori */}
            <div className="space-y-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                        >
                            {formData.category_id
                                ? (categories.find(
                                      (c) => c.id === formData.category_id,
                                  )?.name ?? 'Pilih kategori')
                                : 'Pilih kategori'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandEmpty>
                                Kategori tidak ditemukan
                            </CommandEmpty>
                            <CommandGroup>
                                {categories.map((c) => (
                                    <CommandItem
                                        key={c.name}
                                        value={c.name}
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
                    <span className="text-sm text-destructive">
                        {errors.category_id}
                    </span>
                )}
            </div>

            {/* Kondisi */}
            <div className="space-y-2">
                <Label htmlFor="kondisi">Kondisi</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                        >
                            {formData.condition
                                ? formData.condition
                                : 'Pilih kondisi'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandEmpty>Kondisi tidak ditemukan</CommandEmpty>
                            <CommandGroup>
                                {conditions.map((condition) => (
                                    <CommandItem
                                        key={condition}
                                        value={condition}
                                        onSelect={() =>
                                            setFormData({
                                                ...formData,
                                                condition,
                                            })
                                        }
                                    >
                                        {condition}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
                {errors.condition && (
                    <span className="text-sm text-destructive">
                        {errors.condition}
                    </span>
                )}
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                        >
                            {formData.status ? formData.status : 'Pilih status'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandEmpty>Status tidak ditemukan</CommandEmpty>
                            <CommandGroup>
                                {statuses.map((status) => (
                                    <CommandItem
                                        key={status}
                                        value={status}
                                        onSelect={() =>
                                            setFormData({
                                                ...formData,
                                                status,
                                            })
                                        }
                                    >
                                        {status}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
                {errors.status && (
                    <span className="text-sm text-destructive">
                        {errors.status}
                    </span>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" className="w-full" disabled={processing}>
                    {processing
                        ? 'Menyimpan...'
                        : initialData?.id
                          ? 'Update Aset'
                          : 'Tambah Aset'}
                </Button>
            </div>
        </form>
    );
}
