import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchDelete, fetchJsonGet, fetchJsonPost } from "../utils/fetch";
import type { ImgData } from "./dataTypes";

export interface StoreItem
{
	id: number;
	name: string;
	price: number;
	count: "many" | "few" | "no";
	img?: string;
}

export interface StoreItemFull
{
	id: number;
	id_big: string;
	name: string;
	price: number;
	count: number;
	img?: string;
}


export function useStoreItems()
{
	return useQuery("storeItems", async () =>
		await fetchJsonGet<StoreItem[]>("/api/store_items")
	);
}

export function useStoreItemsFull()
{
	return useQuery("storeItemsFull", async () =>
		await fetchJsonGet<StoreItemFull[]>("/api/store_items_full")
	);
}


export function useMutationAddItem(onSuccess?: (data: StoreItemFull) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (itemData: ItemData) =>
			await fetchJsonPost<StoreItemFull>("/api/store_item", itemData),
		onSuccess: (data: StoreItemFull) =>
		{
			if (queryClient.getQueryState("storeItemsFull")?.status == "success")
				queryClient.setQueryData("storeItemsFull", (items?: StoreItemFull[]) => items ? [...items, data] : [data]);

			queryClient.invalidateQueries("storeItems", { exact: true });

			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export interface ItemData
{
	name: string,
	price: number,
	count: number,
	img?: ImgData,
}

export function useMutationEditItem(itemId: number, onSuccess?: (data: StoreItemFull) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (itemData: ItemData) =>
			await fetchJsonPost<StoreItemFull>(`/api/store_item/${itemId}`, itemData),
		onSuccess: (data: StoreItemFull) =>
		{
			if (queryClient.getQueryState("storeItemsFull")?.status == "success")
				queryClient.setQueryData("storeItemsFull", (items?: StoreItemFull[]) => items?.map(v => v.id == data.id ? data : v) || []);

			queryClient.invalidateQueries("storeItems", { exact: true });

			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export function useMutationDecreaseItem(itemId: number, onSuccess?: (data: StoreItemFull) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchJsonPost<StoreItemFull>(`/api/store_item/${itemId}/decrease`),
		onSuccess: (data: StoreItemFull) =>
		{
			if (queryClient.getQueryState("storeItemsFull")?.status == "success")
				queryClient.setQueryData("storeItemsFull", (items?: StoreItemFull[]) => items?.map(v => v.id == data.id ? data : v) || []);

			queryClient.invalidateQueries("storeItems", { exact: true });

			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export function useMutationDeleteItem(itemId: number, onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchDelete(`/api/store_item/${itemId}`),
		onSuccess: () =>
		{
			if (queryClient.getQueryState("storeItemsFull")?.status == "success")
				queryClient.setQueryData("storeItemsFull", (items?: StoreItemFull[]) => items?.filter(v => v.id != itemId) || []);

			queryClient.invalidateQueries("storeItems", { exact: true });

			onSuccess?.();
		},
		onError: onError,
	});
	return mutation;
}
