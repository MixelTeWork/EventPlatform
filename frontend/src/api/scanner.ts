import { useMutation, useQueryClient } from "react-query";
import { fetchJsonPost } from "../utils/fetch";
import { createEmptyUser, type User } from "./user";
import { queryInvalidate } from "../utils/query";


export default function useMutationScanner(onSuccess?: (data: ScannerRes) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (scannerData: ScannerData) =>
		{
			const res = await fetchJsonPost<ScannerRes>("/api/scanner", scannerData)
			queryClient.setQueryData<User>("user", user =>
			{
				user = user || createEmptyUser();
				user.balance = res.balance;
				if (res.res == "ok" && res.action == "promote")
					queryInvalidate(queryClient, "user");
				if (res.res == "ok" && res.action == "quest")
					queryInvalidate(queryClient, "quests");
				return user;
			});
			return res;
		},
		onSuccess: onSuccess,
		onError: onError,
	});
	return mutation;
}

interface ScannerData
{
	code: string,
}

export interface ScannerRes
{
	res: "ok" | "wrong" | "error",
	action: "quest" | "store" | "send" | "promote",
	value: number,
	msg: string,
	balance: number,
}
