import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface Status {
    id: number;
    name: string;
    color: string;
    description: string;
}

interface Props {
    title: string;
    statuses: Status[];
}

export function Statuses({ title, statuses }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    Status ditentukan oleh sistem dan tidak dapat diubah
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    {statuses.map((status) => (
                        <div
                            key={status.id}
                            className="flex items-center justify-between rounded-lg border p-4"
                        >
                            <div className="flex items-center gap-4">
                                <Badge variant={status.color as any}>
                                    {status.name}
                                </Badge>

                                <div className="text-sm text-muted-foreground">
                                    {status.description}
                                </div>
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
    );
}
