import { QueryClient, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchDelete, fetchJsonPost } from "./fetch";

export function useStdMutation<TData, TRes>(url: string, onSuccessM?: (queryClient: QueryClient, data: TRes) => void)
{
	function useMutationFn(onSuccess?: (data: TRes) => void, onError?: (err: any) => void)
	{
		const queryClient = useQueryClient();
		const mutation = useMutation({
			mutationFn: async (itemData: TData) =>
				await fetchJsonPost<TRes>(url, itemData),
			onSuccess: (data: TRes) =>
			{
				onSuccessM?.(queryClient, data);
				onSuccess?.(data);
			},
			onError: onError,
		});
		return mutation;
	}
	return useMutationFn;
}

type TItemUrl = string | ((id: number) => string);
function itemUrl(url: TItemUrl, id: number)
{
	return typeof url == "function" ? url(id) : `${url}/${id}`;
}

export function useItemMutation<TData, TRes>(url: TItemUrl, onSuccessM?: (queryClient: QueryClient, data: TRes) => void)
{
	function useMutationFn(id: number, onSuccess?: (data: TRes) => void, onError?: (err: any) => void)
	{
		const queryClient = useQueryClient();
		const mutation = useMutation({
			mutationFn: async (itemData: TData) =>
				await fetchJsonPost<TRes>(itemUrl(url, id), itemData),
			onSuccess: (data: TRes) =>
			{
				onSuccessM?.(queryClient, data);
				onSuccess?.(data);
			},
			onError: onError,
		});
		return mutation;
	}
	return useMutationFn;
}

export function useItemDeleteMutation(url: TItemUrl, onSuccessM?: (queryClient: QueryClient, id: number) => void)
{
	function useMutationFn(id: number, onSuccess?: () => void, onError?: (err: any) => void)
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
	return useMutationFn;
}
