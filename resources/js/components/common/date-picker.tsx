import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

function formatDate(date: Date | undefined) {
    if (!date) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function disableFutureDates(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
}

export default function DatePickerField({
    label,
    value,
    defaultValue,
    onChange,
}: {
    label: string;
    value: string;
    defaultValue?: string;
    onChange: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(
        value
            ? new Date(value)
            : defaultValue
              ? new Date(defaultValue)
              : undefined,
    );
    const [month, setMonth] = useState<Date | undefined>(date);

    useEffect(() => {
        setDate(
            value
                ? new Date(value)
                : defaultValue
                  ? new Date(defaultValue)
                  : undefined,
        );
        setMonth(
            value
                ? new Date(value)
                : defaultValue
                  ? new Date(defaultValue)
                  : undefined,
        );
    }, [value]);

    return (
        <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-muted-foreground">
                {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between font-normal"
                    >
                        {date ? formatDate(date) : 'Pilih Tanggal'}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                >
                    <Calendar
                        mode="single"
                        selected={date}
                        month={month}
                        onMonthChange={setMonth}
                        onSelect={(selected) => {
                            setDate(selected);
                            onChange(formatDate(selected));
                            setOpen(false);
                        }}
                        disabled={disableFutureDates}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
