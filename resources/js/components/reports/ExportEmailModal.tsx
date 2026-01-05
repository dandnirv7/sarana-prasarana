import AlertToast from '@/components/common/alert-toast';
import Modal from '@/components/common/modal';
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
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface ExportReportEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    exportType: 'pdf' | 'excel';
    filterState: {
        startDate: string;
        endDate: string;
        status: string;
    };
}

export default function ExportReportEmailModal({
    isOpen,
    onClose,
    exportType,
    filterState,
}: ExportReportEmailModalProps) {
    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const form = useForm<{
        email: string;
        start_date: string;
        end_date: string;
        status: string;
    }>({
        email: '',
        start_date: filterState.startDate || '',
        end_date: filterState.endDate || '',
        status: filterState.status || 'semua',
    });

    useEffect(() => {
        form.setData((prev) => ({
            ...prev,
            start_date: filterState.startDate || '',
            end_date: filterState.endDate || '',
            status: filterState.status || 'semua',
        }));
    }, [filterState]);

    const submit = () => {
        const url =
            exportType === 'pdf'
                ? '/reports/export-pdf-email'
                : '/reports/export-excel-email';

        form.post(url, {
            onSuccess: () => {
                setAlert({
                    type: 'success',
                    message: `Laporan ${exportType.toUpperCase()} berhasil dikirim ke email`,
                });
                onClose();
                form.reset();
            },
            onError: () => {
                setAlert({
                    type: 'error',
                    message: 'Gagal mengirim laporan ke email',
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
                        <Label>Email Tujuan</Label>
                        <Input
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            placeholder="admin@sarpras.test"
                        />
                        {form.errors.email && (
                            <p className="text-sm text-red-600">
                                {form.errors.email}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Tanggal Mulai</Label>
                            <Input
                                type="date"
                                value={form.data.start_date}
                                onChange={(e) =>
                                    form.setData('start_date', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Tanggal Akhir</Label>
                            <Input
                                type="date"
                                value={form.data.end_date}
                                onChange={(e) =>
                                    form.setData('end_date', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Status</Label>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData('status', value)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua</SelectItem>
                                <SelectItem value="sesuai">Sesuai</SelectItem>
                                <SelectItem value="rusak">Rusak</SelectItem>
                                <SelectItem value="hilang">Hilang</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button
                            onClick={submit}
                            disabled={
                                !form.data.email ||
                                !form.data.start_date ||
                                !form.data.end_date
                            }
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
