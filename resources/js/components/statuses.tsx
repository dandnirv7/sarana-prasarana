import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AlertToast from './common/alert-toast';
import DoubleConfirmationModal from './common/double-confirmation-modal';
import Modal from './common/modal';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Status {
    id: number;
    name: string;
    description: string;
}

interface StatusesProps {
    title: string;
    statuses: Status[];
    onSave: (name: string, description: string, type: string) => void;
    onUpdate: (
        id: number,
        name: string,
        description: string,
        type: string,
    ) => void;
    onDelete: (id: number) => void;
}

export function Statuses({
    title,
    statuses,
    onSave,
    onUpdate,
    onDelete,
}: StatusesProps) {
    const [statusModal, setStatusModal] = useState({
        open: false,
        mode: 'add',
        statusId: null,
    });
    const [statusForm, setStatusForm] = useState({
        name: '',
        description: '',
        type: 'borrowing',
    });

    const [deleteTarget, setDeleteTarget] = useState<Status | null>(null);
    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const handleSaveStatus = (e: any) => {
        e.preventDefault();
        if (statusModal.mode === 'add') {
            onSave(statusForm.name, statusForm.description, statusForm.type);
        } else if (statusModal.mode === 'edit' && statusModal.statusId) {
            onUpdate(
                statusModal.statusId,
                statusForm.name,
                statusForm.description,
                statusForm.type,
            );
        }
        setStatusModal({ open: false, mode: 'add', statusId: null });
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            onDelete(deleteTarget.id);
            setAlert({ type: 'success', message: 'Status berhasil dihapus' });
            setDeleteTarget(null);
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>
                            Status ditentukan oleh sistem dan tidak dapat diubah
                        </CardDescription>
                    </div>
                    <Button
                        onClick={() => {
                            setStatusModal({
                                open: true,
                                mode: 'add',
                                statusId: null,
                            });
                            setStatusForm({
                                name: '',
                                description: '',
                                type: 'borrowing',
                            });
                        }}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Status
                    </Button>
                </CardHeader>

                <CardContent>
                    <div className="space-y-3">
                        {statuses.map((status) => (
                            <div
                                key={status.id}
                                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex items-center gap-4">
                                    <Badge variant="default">
                                        {status.name}
                                    </Badge>

                                    <div className="text-sm text-muted-foreground">
                                        {status.description}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setStatusModal({
                                                open: true,
                                                mode: 'edit',
                                                statusId: status.id,
                                            });
                                            setStatusForm({
                                                name: status.name,
                                                description: status.description,
                                                type: status.type,
                                            });
                                        }}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteTarget(status)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {statuses.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground">
                                Tidak ada status tersedia
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={statusModal.open}
                onClose={() =>
                    setStatusModal({ open: false, mode: 'add', statusId: null })
                }
                title={
                    statusModal.mode === 'add' ? 'Tambah Status' : 'Edit Status'
                }
            >
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="statusName">Nama Status</Label>
                        <Input
                            id="statusName"
                            value={statusForm.name}
                            onChange={(e) =>
                                setStatusForm({
                                    ...statusForm,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Masukkan nama status"
                        />
                    </div>
                    <div>
                        <Label htmlFor="statusDesc">Deskripsi</Label>
                        <Input
                            id="statusDesc"
                            value={statusForm.description}
                            onChange={(e) =>
                                setStatusForm({
                                    ...statusForm,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Masukkan deskripsi"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setStatusModal({
                                    open: false,
                                    mode: 'add',
                                    statusId: null,
                                })
                            }
                        >
                            Batal
                        </Button>
                        <Button onClick={handleSaveStatus}>Simpan</Button>
                    </div>
                </div>
            </Modal>

            {deleteTarget && (
                <DoubleConfirmationModal
                    isOpen={!!deleteTarget}
                    title="Hapus Status"
                    message={`Apakah Anda yakin ingin menghapus status "${deleteTarget.name}"?`}
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
        </>
    );
}
