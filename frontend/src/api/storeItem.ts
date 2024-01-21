import { useQuery } from "react-query";
import { fetchJsonGet } from "../utils/fetch";

export interface StoreItem
{
	id: number;
	name: string;
	price: number;
}


export default function useStoreItems()
{
	return useQuery("storeItems", async () =>
		await fetchJsonGet<StoreItem[]>("/api/store_items")
	);
}
