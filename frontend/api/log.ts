import { Modify } from "./dataTypes";
import { fetchJsonGet } from "../utils/fetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { stdQuery } from "@/utils/query";
import { stdMutation } from "@/utils/mutations";

export interface LogItem
{
	id: number,
	actionCode: "added" | "updated" | "deleted" | "restored",
	date: Date,
	recordId: number,
	userId: number,
	userName: string,
	tableName: "User" | "Role" | "Event" | "Ticket" | "TicketType" | "PermissionAccess",
	changes: [string, any, any][],
}

type LogItemResponse = Modify<LogItem, {
	date: string,
}>

export interface LogLenResponse
{
	len: number,
}

const url = "/api/dev"
const queryKey = () => ["log"];
const queryKeyPage = (page: number) => ["log", `${page}`];
const queryKeyLen = () => ["log"];

export function useLog(page = 0)
{
	const queryClient = useQueryClient();
	const queryPage = (p: number) => ({
		queryKey: queryKeyPage(p),
		queryFn: async () => (await fetchJsonGet<LogItemResponse[]>(`${url}/log?p=${p}`)).map(res =>
		{
			const log = res as unknown as LogItem;
			log.date = new Date(res.date);
			return log;
		})
	});
	queryClient.prefetchQuery(queryPage(page - 1));
	queryClient.prefetchQuery(queryPage(page + 1));
	return useQuery(queryPage(page));
}

export function useLogCacheClear()
{
	const queryClient = useQueryClient();
	return () =>
	{
		queryClient.removeQueries({ queryKey: queryKey() });
		queryClient.invalidateQueries({ queryKey: queryKeyLen() });
	}
}

export const useLogLen = stdQuery<LogLenResponse>(queryKeyLen(), `${url}/log_len`);

interface Msg { msg: string }
export const useMutationSetMsg = stdMutation<Msg, Msg>(url + "/set_msg");
