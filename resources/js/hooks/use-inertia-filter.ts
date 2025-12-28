import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useDebounce } from './use-debounce';

export function useInertiaFilter<T extends Record<string, any>>(
    url: string,
    initialFilters: T,
) {
    const [filters, setFilters] = useState<T>(initialFilters);
    const debouncedSearch = useDebounce((filters as any).search ?? '', 500);

    const apply = (params: Partial<T> & { page?: number } = {}) => {
        const next = { ...filters, ...params };
        setFilters(next);

        const queryParams: Partial<T> & { page?: number } = {};

        Object.keys(next).forEach((key) => {
            const value = (next as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                if (
                    (key === 'status' && value === 'all') ||
                    (key === 'role' && value === 'all')
                )
                    return;
                (queryParams as any)[key] = value;
            }
        });

        if (params.page && params.page !== 1) {
            queryParams.page = params.page;
        }

        router.get(url, queryParams, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        apply({ ...(filters as any), search: debouncedSearch });
    }, [
        debouncedSearch,
        filters.status,
        filters.kategori,
        filters.start_date,
        filters.end_date,
        filters.role,
    ]);

    return { filters, setFilters, apply };
}
