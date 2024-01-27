import { useMutation, useQuery } from "react-query";
import { fetchJsonGet, fetchJsonPost } from "../utils/fetch";

export interface StoreItem
{
	id: number;
	name: string;
	price: number;
	img: string;
}


export function useStoreItems()
{
	return useQuery("storeItems", async () =>
		await fetchJsonGet<StoreItem[]>("/api/store_items")
	);
}


export interface SellData
{
	userId: number,
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
			res.playerId = data.userId;
			onSuccess?.(res);
		},
		onError: onError,
	});
	return mutation;
}

export interface SellCheckRes
{
	res: "ok" | "no_item" | "no_player" | "no_money",
	item: StoreItem,
	player: string,
	itemId: number,
	playerId: number,
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
	player: string,
}
