import api from '../lib/axios';
import { useQuery, useMutation, UseQueryResult, UseMutationResult, UseQueryOptions } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';


const get_path_list: Record<string, string> = {
    students: "/students",
    classes : "/classes"
};

const create_path: Record<string, string> = {
    students: "/students",
};

const get_one_path: Record<string, string> = {  
    students: "/students",
};


const delete_path: Record<string, string> = {
    students: "/students",
};

const update_path: Record<string, string> = {
    students: "/students",
};

const get_one_dashboard_path: Record<string, string> = {
    Admindashboard : "/dashboard/admin",
    TeacherDashboard : "/dashboard/teacher",
    ParentDashboard : "/dashboard/parent"
}

const get_update_password: Record<string, string> = {
    default : "/auth/update-password"
}


interface UseListQueryOptions {
  page?: number;
  perPage?: number;
  filter?: Record<string, any>;
}

interface UseGetOneQueryOptions {
  id: string;
  onSuccess?: (data: { data: any }) => void;
  onError?: (error: any) => void;
}

interface UseMutationOptions<TData = any, TVariables = any> {
  onSuccess?: (data: TData) => void;
  onError?: (error: any) => void;
}

const dataProvider = {
    // CRUD methods first so hooks can reference them
    getList: async (
        resource: keyof typeof get_path_list,
        params: {
            pagination?: { page: number; perPage: number };
            filter?: Record<string, any>;
        } = {}
    ): Promise<{ data: any[]; total: number }> => {
        const url = get_path_list[resource];
        const { page = 1, perPage = 10 } = params.pagination || {};
        const filter = params.filter || {};
        const query = new URLSearchParams({
            page: String(page),
            perPage: String(perPage),
            ...Object.fromEntries(Object.entries(filter).map(([k, v]) => [k, String(v)])),
        }).toString();
        const response = await api.get(`${url}?${query}`);
        return {
            data: response.data.data,
            total: response.data.total || response.data.data.length,
        };
    },
    getOne: async (
        resource: keyof typeof get_one_path,
        params: { id: string }
    ): Promise<{ data: any }> => {
        let url = `${get_one_path[resource]}/${params.id}`;
        const response = await api.get(url);
        return {
            data: response.data.data,
        };
    },
    create: async (
        resource: keyof typeof create_path,
        params: { data: any }
    ): Promise<{ data: any }> => {
        const url = create_path[resource];
        const response = await api.post(url, params.data);
        return {
            data: { ...params.data, id: response.data.id },
        };
    },
    update: async (
        resource: keyof typeof update_path,
        params: { id: string; data: any }
    ): Promise<{ data: any }> => {
        const url = `${update_path[resource]}/${params.id}`;
        const response = await api.put(url, params.data);
        return {
            data: response.data.data,
        };
    },
    delete: async (
        resource: keyof typeof delete_path,
        params: { id: string }
    ): Promise<{ data: any }> => {
        const url = `${delete_path[resource]}/${params.id}`;
        const response = await api.delete(url);
        return {
            data: response.data,
        };
    },
    // React Query hooks
    useListQuery: (
        resource: keyof typeof get_path_list,
        options: UseListQueryOptions = {},
        queryOptions: {
            onSuccess?: (data: { data: any[]; total: number }) => void;
            onError?: (error: unknown) => void;
        } = {}
    ): UseQueryResult<{ data: any[]; total: number }, unknown> => {
        const { enqueueSnackbar } = useSnackbar();
        const { page = 1, perPage = 10, filter = {} } = options;
        const onSuccess = (data: { data: any[]; total: number }) => {
            if (queryOptions.onSuccess) queryOptions.onSuccess(data);
            else enqueueSnackbar('Data loaded successfully!', { variant: 'success' });
        };
        const onError = (error: unknown) => {
            if (queryOptions.onError) queryOptions.onError(error);
            else enqueueSnackbar('Failed to load data.', { variant: 'error' });
        };
        const queryOptionsObject = {
            queryKey: [resource, page, perPage, filter] as const,
            queryFn: () => dataProvider.getList(resource, { pagination: { page, perPage }, filter }),
            onSuccess,
            onError,
        };
        return useQuery(queryOptionsObject);
    },
    useGetOneQuery: (
        resource: keyof typeof get_one_path,
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
        resource: keyof typeof create_path,
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
        resource: keyof typeof update_path,
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
        resource: keyof typeof delete_path,
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
};

export default dataProvider;
