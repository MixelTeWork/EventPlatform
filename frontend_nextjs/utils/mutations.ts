import { QueryClient, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchDelete, fetchJsonPost, fetchPost } from "./fetch";

export function stdMutation<TData, TRes>(url: TUrl<TData>, onSuccessM?: (queryClient: QueryClient, data: TRes) => void, preprocessReqData: (data: TData) => any = d => d)
{
	return (onSuccess?: (data: TRes) => void, onError?: (err: any) => void) =>
	{
		const queryClient = useQueryClient();
		const mutation = useMutation({
			mutationFn: async (data: TData) =>
				await fetchJsonPost<TRes>(getUrl(url, data), preprocessReqData(data)),
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

export function stdMutationNoRes<TData>(url: TUrl<TData>, onSuccessM?: (queryClient: QueryClient, data: TData) => void, preprocessReqData: (data: TData) => any = d => d)
{
	return (onSuccess?: () => void, onError?: (err: any) => void) =>
	{
		const queryClient = useQueryClient();
		const mutation = useMutation({
			mutationFn: async (data: TData) =>
			{
				await fetchPost(getUrl(url, data), preprocessReqData(data));
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

type TUrl<T> = string | ((data: T) => string);
function getUrl<T>(url: TUrl<T>, data: T)
{
	return typeof url == "function" ? url(data) : url;
}

type TItemUrl = string | ((id: number) => string);
function itemUrl(url: TItemUrl, id: number)
{
	return typeof url == "function" ? url(id) : `${url}/${id}`;
}

export function itemMutation<TData, TRes>(url: TItemUrl, onSuccessM?: (queryClient: QueryClient, data: TRes) => void, preprocessReqData: (data: TData, id: number) => any = d => d)
{
	return (id: number, onSuccess?: (data: TRes) => void, onError?: (err: any) => void) =>
	{
		const queryClient = useQueryClient();
		const mutation = useMutation({
			mutationFn: async (data: TData) =>
				await fetchJsonPost<TRes>(itemUrl(url, id), preprocessReqData(data, id)),
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
