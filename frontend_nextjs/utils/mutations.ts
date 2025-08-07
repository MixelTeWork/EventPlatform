import { QueryClient, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchDelete, fetchJsonPost, fetchPost } from "./fetch";

export function stdMutation<TData, TRes>(url: string, onSuccessM?: (queryClient: QueryClient, data: TRes) => void)
{
	return (onSuccess?: (data: TRes) => void, onError?: (err: any) => void) =>
	{
		const queryClient = useQueryClient();
		const mutation = useMutation({
			mutationFn: async (data: TData) =>
				await fetchJsonPost<TRes>(url, data),
			onSuccess: (data: TRes) =>
			{
				onSuccessM?.(queryClient, data);
				onSuccess?.(data);
			},
			onError: onError,
		});
		return mutation;
	}
}

export function stdMutationNoRes<TData>(url: string, onSuccessM?: (queryClient: QueryClient, data: TData) => void)
{
	return (onSuccess?: () => void, onError?: (err: any) => void) =>
	{
		const queryClient = useQueryClient();
		const mutation = useMutation({
			mutationFn: async (data: TData) =>
			{
				await fetchPost(url, data);
				return data;
			},
			onSuccess: (data: TData) =>
			{
				onSuccessM?.(queryClient, data);
				onSuccess?.();
			},
			onError: onError,
		});
		return mutation;
	}
}

type TItemUrl = string | ((id: number) => string);
function itemUrl(url: TItemUrl, id: number)
{
	return typeof url == "function" ? url(id) : `${url}/${id}`;
}

export function itemMutation<TData, TRes>(url: TItemUrl, onSuccessM?: (queryClient: QueryClient, data: TRes) => void)
{
	return (id: number, onSuccess?: (data: TRes) => void, onError?: (err: any) => void) =>
	{
		const queryClient = useQueryClient();
		const mutation = useMutation({
			mutationFn: async (data: TData) =>
				await fetchJsonPost<TRes>(itemUrl(url, id), data),
			onSuccess: (data: TRes) =>
			{
				onSuccessM?.(queryClient, data);
				onSuccess?.(data);
			},
			onError: onError,
		});
		return mutation;
	}
}

export function itemDeleteMutation(url: TItemUrl, onSuccessM?: (queryClient: QueryClient, id: number) => void)
{
	return (id: number, onSuccess?: () => void, onError?: (err: any) => void) =>
	{
		const queryClient = useQueryClient();
		const mutation = useMutation({
			mutationFn: async () =>
				await fetchDelete(itemUrl(url, id)),
			onSuccess: () =>
			{
				onSuccessM?.(queryClient, id);
				onSuccess?.();
			},
			onError: onError,
		});
		return mutation;
	}
}
