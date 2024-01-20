import { useQuery } from "react-query";
import { ApiError, ResponseMsg, StoreItem } from "./dataTypes";

export default function useStoreItems()
{
	return useQuery("storeItems", getStoreItems);
}

async function getStoreItems(): Promise<StoreItem[]>
{
	const res = await fetch("/api/store_items");
	const data = await res.json();
	if (!res.ok) throw new ApiError((data as ResponseMsg).msg);

	return data as StoreItem[];
}
