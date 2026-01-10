import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';

export type BaseInertiaFilter = {
    search?: string;
    status?: string;
    kategori?: string;
    role?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
};

export function useInertiaFilter<T extends BaseInertiaFilter>(
    url: string,
    initialFilters: T,
) {
    const [filters, setFiltersState] = useState<T>(initialFilters);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const applyQuery = (updated: T) => {
        const queryParams: Record<string, any> = {};

        Object.entries(updated).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;

            if (
                (key === 'status' && value === 'semua') ||
                (key === 'role' && value === 'semua')
            )
                return;

            queryParams[key] = value;
        });

        if (queryParams.page === 1) delete queryParams.page;

        router.get(url, queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const setFilters = (next: Partial<T> & { page?: number }) => {
        const updated = { ...filters, ...next };
        setFiltersState(updated);
        applyQuery(updated);
    };

    const setSearch = (search: string, delay = 500) => {
        const updated = { ...filters, search };
        setFiltersState(updated);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            applyQuery(updated);
        }, delay);
    };

    const apply = (params: Partial<T> & { page?: number } = {}) => {
        const updated = { ...filters, ...params };
        setFiltersState(updated);
        applyQuery(updated);
    };

    return {
        filters,
        setFilters,
        setSearch,
        apply,
    };
}
