import api from '../lib/axios';
import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';


// Consolidated API paths for all resources
const API_PATHS = {
    students: "/students",
    classes: "/classes",
    teachers: "/teachers",
    courses: "/courses",
    parents: "/parents",
    coursematerial: "/course-materials",
    attendances: "/attendances",
    assessments: "/assessments",
    questions: "/questions",
    grades: "/grades",
    notifications : "/notifications"
} as const;

// Type for resource keys
type ResourceKey = keyof typeof API_PATHS;




interface UseListQueryOptions {
    page?: number;
    perPage?: number;
    filter?: Record<string, any> | string;
    include?: string;
    select?: Record<string, any> | string;
    orderBy?: Record<string, any> | string;
    skip?: number;
    take?: number;
}

interface UseGetOneQueryOptions {
    id: string;
    onSuccess?: (data: { data: any }) => void;
    onError?: (error: any) => void;
}

interface UseMutationOptions<TData = any> {
    onSuccess?: (data: TData) => void;
    onError?: (error: any) => void;
}

// Helper function for advanced search queries
const createAdvancedQuery = (options: {
    filter?: Record<string, any>;
    select?: Record<string, any>;
    orderBy?: Record<string, any>;
    include?: Record<string, any>;
}) => {
    const query: any = {};

    if (options.filter) {
        query.filter = JSON.stringify(options.filter);
    }

    if (options.select) {
        query.select = JSON.stringify(options.select);
    }

    if (options.orderBy) {
        query.orderBy = JSON.stringify(options.orderBy);
    }

    if (options.include) {
        query.include = JSON.stringify(options.include);
    }

    return query;
};

const dataProvider = {
    // CRUD methods first so hooks can reference them
    getList: async (
        resource: ResourceKey,
        params: {
            pagination?: { page: number; perPage: number };
            filter?: Record<string, any> | string;
            include?: string;
            select?: Record<string, any> | string;
            orderBy?: Record<string, any> | string;
            skip?: number;
            take?: number;
        } = {}
    ): Promise<{ data: any[]; total: number }> => {
        try {
            const url = API_PATHS[resource];
            const { page = 1, perPage = 10 } = params.pagination || {};
            const { filter, include, select, orderBy, skip, take } = params;

            const queryObj: Record<string, string> = {
                page: String(page),
                perPage: String(perPage),
            };

            // Handle filter parameter with better type safety
            if (filter) {
                if (typeof filter === 'string') {
                    queryObj.filter = filter;
                } else if (typeof filter === 'object' && filter !== null) {
                    // For complex object filters, stringify the entire filter
                    queryObj.filter = JSON.stringify(filter);
                }
            }

            // Handle advanced search parameters
            if (include) queryObj.include = include;
            if (select) {
                queryObj.select = typeof select === 'string' ? select : JSON.stringify(select);
            }
            if (orderBy) {
                queryObj.orderBy = typeof orderBy === 'string' ? orderBy : JSON.stringify(orderBy);
            }
            if (skip !== undefined) queryObj.skip = String(skip);
            if (take !== undefined) queryObj.take = String(take);

            const query = new URLSearchParams(queryObj).toString();
            const response = await api.get(`${url}?${query}`);
            return {
                data: response.data.data || [],
                total: response.data.total || response.data.data?.length || 0,
            };
        } catch (error) {
            console.error(`Failed to fetch ${resource}:`, error);
            throw new Error(`Failed to load ${resource}. Please check your connection and try again.`);
        }
    },
    getOne: async (
        resource: ResourceKey,
        params: { id: string }
    ): Promise<{ data: any }> => {
        try {
            let url = `${API_PATHS[resource]}/${params.id}`;
            const response = await api.get(url);
            return {
                data: response.data.data,
            };
        } catch (error) {
            console.error(`Failed to fetch ${resource} with id ${params.id}:`, error);
            throw new Error(`Failed to load ${resource}. Please check your connection and try again.`);
        }
    },
    create: async (
        resource: ResourceKey,
        params: { data: any }
    ): Promise<{ data: any }> => {
        try {
            const url = API_PATHS[resource];
            const config = params.data instanceof FormData
                ? { headers: { 'Content-Type': 'multipart/form-data' } }
                : {};
            

            const response = await api.post(url, params.data, config);

            // Don't spread FormData - it doesn't work properly
            const fallbackData = params.data instanceof FormData
                ? { id: response.data.id }
                : { ...params.data, id: response.data.id };

            return {
                data: response.data.data || fallbackData,
            };
        } catch (error) {
            console.error(`Failed to create ${resource}:`, error);
            throw new Error(`Failed to create ${resource}. Please try again.`);
        }
    },
    update: async (
        resource: ResourceKey,
        params: { id: string; data: any }
    ): Promise<{ data: any }> => {
        try {
            const url = `${API_PATHS[resource]}/${params.id}`;
            const config = params.data instanceof FormData
                ? { headers: { 'Content-Type': 'multipart/form-data' } }
                : {};

            const response = await api.put(url, params.data, config);
            return {
                data: response.data.data,
            };
        } catch (error) {
            console.error(`Failed to update ${resource}:`, error);
            throw new Error(`Failed to update ${resource}. Please try again.`);
        }
    },
    delete: async (
        resource: ResourceKey,
        params: { id: string }
    ): Promise<{ data: any }> => {
        try {
            const url = `${API_PATHS[resource]}/${params.id}`;
            const response = await api.delete(url);
            return {
                data: response.data,
            };
        } catch (error) {
            console.error(`Failed to delete ${resource}:`, error);
            throw new Error(`Failed to delete ${resource}. Please try again.`);
        }
    },
    // React Query hooks
    useListQuery: (
        resource: ResourceKey,
        options: UseListQueryOptions = {},
        queryOptions: {
            onSuccess?: (data: { data: any[]; total: number }) => void;
            onError?: (error: unknown) => void;
        } = {}
    ): UseQueryResult<{ data: any[]; total: number }, unknown> => {
        const { enqueueSnackbar } = useSnackbar();
        const {
            page = 1,
            perPage = 10,
            filter = {},
            include,
            select,
            orderBy,
            skip,
            take
        } = options;

        const onSuccess = (data: { data: any[]; total: number }) => {
            if (queryOptions.onSuccess) queryOptions.onSuccess(data);
            // Remove automatic success notifications for data loading to reduce noise
        };
        const onError = (error: unknown) => {
            if (queryOptions.onError) queryOptions.onError(error);
            else enqueueSnackbar('Failed to load data.', { variant: 'error' });
        };

        const queryOptionsObject = {
            queryKey: [resource, page, perPage, filter, include, select, orderBy, skip, take] as const,
            queryFn: () => dataProvider.getList(resource, {
                pagination: { page, perPage },
                filter,
                include,
                select,
                orderBy,
                skip,
                take
            }),
            onSuccess,
            onError,
        };
        return useQuery(queryOptionsObject);
    },
    useGetOneQuery: (
        resource: ResourceKey,
        options: UseGetOneQueryOptions
    ): UseQueryResult<{ data: any }, unknown> => {
        const { enqueueSnackbar } = useSnackbar();
        const { id, onSuccess, onError } = options;
        const queryOptions: any = {
            queryKey: [resource, id],
            queryFn: () => dataProvider.getOne(resource, { id }),
            enabled: !!id,
            onSuccess: (data: { data: any }) => {
                if (onSuccess) onSuccess(data);
                else enqueueSnackbar('Item loaded successfully!', { variant: 'success' });
            },
            onError: (error: any) => {
                if (onError) onError(error);
                else enqueueSnackbar('Failed to load item.', { variant: 'error' });
            },
        };
        return useQuery<{ data: any }, unknown>(queryOptions);
    },
    useCreateMutation: (
        resource: ResourceKey,
        mutationOptions: UseMutationOptions = {}
    ): UseMutationResult<{ data: any }, unknown, { data: any }> => {
        const { enqueueSnackbar } = useSnackbar();
        return useMutation<{ data: any }, unknown, { data: any }>({
            mutationFn: (variables) => dataProvider.create(resource, variables),
            onSuccess: (data) => {
                if (mutationOptions.onSuccess) mutationOptions.onSuccess(data);
                else enqueueSnackbar('Created successfully!', { variant: 'success' });
            },
            onError: (error) => {
                if (mutationOptions.onError) mutationOptions.onError(error);
                else enqueueSnackbar('Create failed.', { variant: 'error' });
            },
        });
    },
    useUpdateMutation: (
        resource: ResourceKey,
        mutationOptions: UseMutationOptions = {}
    ): UseMutationResult<{ data: any }, unknown, { id: string; data: any }> => {
        const { enqueueSnackbar } = useSnackbar();
        return useMutation<{ data: any }, unknown, { id: string; data: any }>({
            mutationFn: (variables) => dataProvider.update(resource, variables),
            onSuccess: (data) => {
                if (mutationOptions.onSuccess) mutationOptions.onSuccess(data);
                else enqueueSnackbar('Updated successfully!', { variant: 'success' });
            },
            onError: (error) => {
                if (mutationOptions.onError) mutationOptions.onError(error);
                else enqueueSnackbar('Update failed.', { variant: 'error' });
            },
        });
    },
    useDeleteMutation: (
        resource: ResourceKey,
        mutationOptions: UseMutationOptions = {}
    ): UseMutationResult<{ data: any }, unknown, { id: string }> => {
        const { enqueueSnackbar } = useSnackbar();
        return useMutation<{ data: any }, unknown, { id: string }>({
            mutationFn: (variables) => dataProvider.delete(resource, variables),
            onSuccess: (data) => {
                if (mutationOptions.onSuccess) mutationOptions.onSuccess(data);
                else enqueueSnackbar('Deleted successfully!', { variant: 'success' });
            },
            onError: (error) => {
                if (mutationOptions.onError) mutationOptions.onError(error);
                else enqueueSnackbar('Delete failed.', { variant: 'error' });
            },
        });
    },

    // Advanced search helper
    createAdvancedQuery,

    // Convenient method for advanced list queries
    useAdvancedListQuery: (
        resource: ResourceKey,
        advancedOptions: {
            filter?: Record<string, any>;
            select?: Record<string, any>;
            orderBy?: Record<string, any>;
            include?: Record<string, any>;
            page?: number;
            perPage?: number;
        },
        queryOptions: {
            onSuccess?: (data: { data: any[]; total: number }) => void;
            onError?: (error: unknown) => void;
        } = {}
    ): UseQueryResult<{ data: any[]; total: number }, unknown> => {
        const {
            filter,
            select,
            orderBy,
            include,
            page = 1,
            perPage = 10
        } = advancedOptions;

        return dataProvider.useListQuery(resource, {
            page,
            perPage,
            filter,
            select,
            orderBy,
            include: include ? JSON.stringify(include) : undefined
        }, queryOptions);
    }
};

export default dataProvider;
