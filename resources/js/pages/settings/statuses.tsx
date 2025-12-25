import { Statuses } from '@/components/statuses';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

interface Status {
    id: number;
    name: string;
    description: string;
}

interface Props {
    borrowingStatuses: Status[];
    assetStatuses: Status[];
}

const breadcrumbs = [
    { title: 'Pengaturan', href: '/settings' },
    { title: 'Status', href: '/settings/status' },
];

export default function StatusPage({
    borrowingStatuses,
    assetStatuses,
}: Props) {
    const handleSaveStatus = (
        name: string,
        description: string,
        type: string,
    ) => {
        router.post('/settings/statuses', { name, description, type });
    };

    const handleUpdateStatus = (
        id: number,
        name: string,
        description: string,
        type: string,
    ) => {
        router.put(`/settings/statuses/${id}`, { name, description, type });
    };

    const handleDeleteStatus = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus status ini?')) {
            router.delete(`/settings/statuses/${id}`, {
                onSuccess: () => {
                    alert('Status berhasil dihapus');
                },
                onError: () => {
                    alert('Gagal menghapus status');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Status" />
            <div className="grid grid-cols-1 gap-6 space-y-6 p-4 md:grid-cols-2">
                <Statuses
                    title="Status Peminjaman"
                    statuses={borrowingStatuses}
                    onSave={handleSaveStatus}
                    onUpdate={handleUpdateStatus}
                    onDelete={handleDeleteStatus}
                />
                <Statuses
                    title="Status Aset"
                    statuses={assetStatuses}
                    onSave={handleSaveStatus}
                    onUpdate={handleUpdateStatus}
                    onDelete={handleDeleteStatus}
                />
            </div>
        </AppLayout>
    );
}
