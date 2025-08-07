import { useQuery, type QueryClient, type QueryKey } from "@tanstack/react-query";
import { fetchJsonGet } from "./fetch";

export function useStdQuery<T>(queryKey: QueryKey, url: string)
{
	return () => useQuery({
		queryKey: queryKey,
		queryFn: async () => await fetchJsonGet<T>(url)
	});
}

export function queryInvalidate(queryClient: QueryClient, queryKey: QueryKey, exact = true)
{
	queryClient.invalidateQueries({ queryKey, exact });
}

export function queryListAddItem<T>(queryClient: QueryClient, queryKey: QueryKey, item: T)
{
	if (queryClient.getQueryState(queryKey)?.status == "success")
		queryClient.setQueryData(queryKey, (items?: T[]) => items ? [...items, item] : undefined);
}

export function queryListUpdateItem<T extends ObjWithId>(queryClient: QueryClient, queryKey: QueryKey, item: T)
{
	if (queryClient.getQueryState(queryKey)?.status == "success")
		queryClient.setQueryData(queryKey, (items?: T[]) => items?.map(v => v.id == item.id ? item : v));
}

export function queryListDeleteItem<T extends ObjWithId>(queryClient: QueryClient, queryKey: QueryKey, itemId: number | string)
{
	if (queryClient.getQueryState(queryKey)?.status == "success")
		queryClient.setQueryData(queryKey, (items?: T[]) => items?.filter(v => v.id != itemId));
}

interface ObjWithId
{
	id: number | string,
}
