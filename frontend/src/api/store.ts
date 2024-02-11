import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchDelete, fetchJsonGet, fetchJsonPost } from "../utils/fetch";
import type { ImgData } from "./dataTypes";

export interface StoreItem
{
	id: number;
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


export interface SellData
{
	userId: string,
	itemId: number,
}

export function useMutationSellItemCheck(onSuccess?: (data: SellCheckRes) => void, onError?: (err: any) => void)
{
	const mutation = useMutation({
		mutationFn: async (sellData: SellData) =>
			await fetchJsonPost<SellCheckRes>("/api/store_sell_check", sellData),
		onSuccess: (res, data) =>
		{
			res.itemId = data.itemId;
			res.visitorId = data.userId;
			onSuccess?.(res);
		},
		onError: onError,
	});
	return mutation;
}

export interface SellCheckRes
{
	res: "ok" | "no_item" | "no_visitor" | "no_money",
	item: StoreItem,
	visitor: string,
	itemId: number,
	visitorId: string,
}

export function useMutationSellItem(onSuccess?: (data: SellItemRes) => void, onError?: (err: any) => void)
{
	const mutation = useMutation({
		mutationFn: async (sellData: SellData) =>
			await fetchJsonPost<SellItemRes>("/api/store_sell", sellData),
		onSuccess: onSuccess,
		onError: onError,
	});
	return mutation;
}

export interface SellItemRes
{
	res: "ok" | "no_money",
	item: string,
	visitor: string,
}

export function useMutationAddItem(onSuccess?: (data: StoreItem) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (itemData: ItemData) =>
			await fetchJsonPost<StoreItem>("/api/store_item", itemData),
		onSuccess: (data: StoreItem) =>
		{
			if (queryClient.getQueryState("storeItems")?.status == "success")
				queryClient.setQueryData("storeItems", (items?: StoreItem[]) => items ? [...items, data] : [data]);

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

export function useMutationEditItem(onSuccess?: (data: StoreItem) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (itemData: ItemDataWithId) =>
			await fetchJsonPost<StoreItem>(`/api/store_item/${itemData.id}`, itemData),
		onSuccess: (data: StoreItem) =>
		{
			if (queryClient.getQueryState("storeItems")?.status == "success")
				queryClient.setQueryData("storeItems", (items?: StoreItem[]) => items?.map(v => v.id == data.id ? data : v) || []);

			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export interface ItemDataWithId extends ItemData
{
	id: number,
}

export function useMutationDecreaseItem(itemId: number, onSuccess?: (data: StoreItem) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchJsonPost<StoreItem>(`/api/store_item/${itemId}/decrease`),
		onSuccess: (data: StoreItem) =>
		{
			if (queryClient.getQueryState("storeItems")?.status == "success")
				queryClient.setQueryData("storeItems", (items?: StoreItem[]) => items?.map(v => v.id == data.id ? data : v) || []);

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
			if (queryClient.getQueryState("storeItems")?.status == "success")
				queryClient.setQueryData("storeItems", (items?: StoreItem[]) => items?.filter(v => v.id != itemId) || []);

			onSuccess?.();
		},
		onError: onError,
	});
	return mutation;
}
