import AlertToast from '@/components/common/alert-toast';
import Modal from '@/components/common/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface ExportEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    exportType: 'pdf' | 'excel';
    filterState: { search: string; status: string };
}

export default function ExportEmailModal({
    isOpen,
    onClose,
    exportType,
    filterState,
}: ExportEmailModalProps) {
    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const emailForm = useForm<{
        email: string;
        search: string;
        status: string;
    }>({
        email: '',
        search: filterState.search || '',
        status: filterState.status || '',
    });

    useEffect(() => {
        emailForm.setData((prev) => ({
            ...prev,
            search: filterState.search || '',
            status: filterState.status || '',
        }));
    }, [filterState.search, filterState.status]);

    const submitExportEmail = () => {
        if (!exportType) return;

        const url =
            exportType === 'pdf'
                ? '/borrowings/export-pdf-email'
                : '/borrowings/export-excel-email';

        emailForm.post(url, {
            onSuccess: () => {
                setAlert({
                    type: 'success',
                    message: `Laporan ${exportType.toUpperCase()} berhasil dikirim ke email`,
                });
                onClose();
                emailForm.reset();
            },
            onError: () => {
                setAlert({
                    type: 'error',
                    message: 'Gagal mengirim email',
                });
            },
        });
    };

    return (
        <div>
            <Modal
                isOpen={isOpen}
                title={`Kirim Laporan ${exportType.toUpperCase()}`}
                onClose={onClose}
            >
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email Tujuan</Label>
                        <Input
                            id="email"
                            type="email"
                            value={emailForm.data.email}
                            onChange={(e) =>
                                emailForm.setData('email', e.target.value)
                            }
                            placeholder="admin@sarpras.test"
                        />
                        {emailForm.errors.email && (
                            <p className="text-sm text-red-600">
                                {emailForm.errors.email}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button
                            onClick={submitExportEmail}
                            disabled={!emailForm.data.email}
                        >
                            Kirim
                        </Button>
                    </div>
                </div>
            </Modal>

            {alert && (
                <AlertToast
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </div>
    );
}
