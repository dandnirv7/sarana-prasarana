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
import { router, usePage } from '@inertiajs/react';
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
        image?: string | null;
    };
    onSuccess?: (message?: string) => void;
    onError?: (errors?: any) => void;
}

export default function AssetForm({
    initialData,
    onSuccess,
    onError,
}: AssetFormProps) {
    const { categories, assetStatuses } = usePage<PageProps>().props;

    const defaultCondition = 'Baik';
    const defaultStatusId =
        assetStatuses.find((s) => s.name === 'Tersedia')?.id ?? 0;

    const [formData, setFormData] = useState({
        name: initialData?.name ?? '',
        category_id: initialData?.category_id ?? 0,
        condition:
            initialData?.condition ?? (initialData ? '' : defaultCondition),
        status_id:
            initialData?.status_id ?? (initialData ? 0 : defaultStatusId),
        image: null as File | null,
    });

    const [preview, setPreview] = useState(initialData?.image ?? '');

    useEffect(() => {
        if (formData.image instanceof File) {
            const url = URL.createObjectURL(formData.image);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        } else if (initialData?.image) {
            setPreview(initialData.image);
        } else {
            setPreview('');
        }
    }, [formData.image, initialData?.image]);

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (formData.image instanceof File) {
            const url = URL.createObjectURL(formData.image);
            setPreview(url);

            return () => URL.revokeObjectURL(url);
        } else if (!initialData?.image) {
            setPreview('');
        }
    }, [formData.image, initialData?.image]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: any = {};
        if (!formData.name) newErrors.name = 'Nama aset wajib diisi';
        if (!formData.category_id)
            newErrors.category_id = 'Kategori wajib diisi';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);
        setErrors({});

        const url = initialData?.id ? `/asset/${initialData.id}` : '/asset';
        const method = initialData?.id ? 'PUT' : 'POST';

        const data = new FormData();
        data.append('name', formData.name);
        data.append('category_id', formData.category_id.toString());
        data.append('condition', formData.condition);
        data.append('status_id', formData.status_id.toString());
        if (formData.image instanceof File) {
            data.append('image_path', formData.image);
        }

        if (method === 'PUT') data.append('_method', 'PUT');

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
                <Select
                    value={formData.category_id.toString()}
                    onValueChange={(val) =>
                        setFormData({ ...formData, category_id: Number(val) })
                    }
                >
                    <SelectTrigger className="min-w-full">
                        <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category_id && (
                    <p className="text-sm text-red-500">{errors.category_id}</p>
                )}
            </div>

            <div>
                <Label>Kondisi</Label>
                <Select
                    value={formData.condition}
                    onValueChange={(val) =>
                        setFormData({ ...formData, condition: val })
                    }
                    disabled={!initialData}
                >
                    <SelectTrigger className="min-w-full">
                        <SelectValue placeholder="Pilih kondisi" />
                    </SelectTrigger>
                    <SelectContent>
                        {[
                            'Baik',
                            'Rusak',
                            'Rusak Ringan',
                            'Rusak Berat',
                            'Perbaikan',
                            'Belum Diperbaiki',
                            'Belum Dikembalikan',
                        ].map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Status</Label>
                <Select
                    value={formData.status_id.toString()}
                    onValueChange={(val) =>
                        setFormData({ ...formData, status_id: Number(val) })
                    }
                    disabled={!initialData}
                >
                    <SelectTrigger className="min-w-full">
                        <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                        {assetStatuses.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Gambar (opsional)</Label>
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            image: e.target.files?.[0] ?? null,
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
