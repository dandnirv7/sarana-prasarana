import { Card, CardContent } from '@/components/ui/card';
import type React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend: string;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    color,
    trend,
}: StatCardProps) {
    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="mb-1 text-sm text-muted-foreground">
                            {title}
                        </p>
                        <p className="text-3xl font-bold">{value}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            {trend}
                        </p>
                    </div>
                    <div className={`rounded-lg p-3 ${color}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
