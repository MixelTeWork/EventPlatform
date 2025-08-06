import { queryInvalidate, queryListAddItem, queryListDeleteItem, queryListUpdateItem, useStdQuery } from "@/utils/query";
import { useItemDeleteMutation, useItemMutation, useStdMutation } from "@/utils/mutations";
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
const queryKey = () => ["storeItems"];
const queryKeyFull = () => ["storeItemsFull"];

export const useStoreItems = useStdQuery<StoreItem[]>(queryKey(), url);
export const useStoreItemsFull = useStdQuery<StoreItemFull[]>(queryKeyFull(), url + "_full");

export interface ItemData
{
	name: string,
	price: number,
	count: number,
	img?: ImgData,
}


export const useMutationStoreItemAdd = useStdMutation<ItemData, StoreItemFull>(url, (qc, data) =>
{
	queryListAddItem(qc, queryKeyFull(), data);
	queryInvalidate(qc, queryKey());
})
export const useMutationStoreItemEdit = useItemMutation<ItemData, StoreItemFull>(url, (qc, data) =>
{
	queryListUpdateItem(qc, queryKeyFull(), data);
	queryInvalidate(qc, queryKey());
})
export const useMutationStoreItemDecrease = useItemMutation<void, StoreItemFull>(id => `${url}/${id}/decrease`, (qc, data) =>
{
	queryListUpdateItem(qc, queryKeyFull(), data);
	queryInvalidate(qc, queryKey());
})
export const useMutationStoreItemDelete = useItemDeleteMutation(url, (qc, id) =>
{
	queryListDeleteItem(qc, queryKeyFull(), id);
	queryInvalidate(qc, queryKey());
})
