import { queryInvalidate, queryListAddItem, queryListDeleteItem, queryListUpdateItem, stdQuery } from "@/utils/query";
import { itemDeleteMutation, itemMutation, stdMutation } from "@/utils/mutations";
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

const url = "/api/store_items"
const urlFull = "/api/store_items_full"
const queryKey = () => ["storeItems"];
const queryKeyFull = () => ["storeItemsFull"];

export const useStoreItems = stdQuery<StoreItem[]>(queryKey(), url);
export const useStoreItemsFull = stdQuery<StoreItemFull[]>(queryKeyFull(), urlFull);

export interface ItemData
{
	name: string,
	price: number,
	count: number,
	img?: ImgData,
}

export const useMutationStoreItemAdd = stdMutation<ItemData, StoreItemFull>(url, (qc, data) =>
{
	queryListAddItem(qc, queryKeyFull(), data);
	queryInvalidate(qc, queryKey());
});

export const useMutationStoreItemEdit = itemMutation<ItemData, StoreItemFull>(url, (qc, data) =>
{
	queryListUpdateItem(qc, queryKeyFull(), data);
	queryInvalidate(qc, queryKey());
});

export const useMutationStoreItemDecrease = itemMutation<void, StoreItemFull>(id => `${url}/${id}/decrease`, (qc, data) =>
{
	queryListUpdateItem(qc, queryKeyFull(), data);
	queryInvalidate(qc, queryKey());
});

export const useMutationStoreItemDelete = itemDeleteMutation(url, (qc, id) =>
{
	queryListDeleteItem(qc, queryKeyFull(), id);
	queryInvalidate(qc, queryKey());
});
