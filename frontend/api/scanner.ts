import { queryInvalidate } from "@/utils/query";
import { stdMutation } from "@/utils/mutations";
import { type User, queryKey as queryKeyUser } from "./user";
import { queryKey as queryKeyQuest } from "./quest";

export interface ScannerRes
{
	res: "ok" | "wrong" | "error",
	action: "quest" | "store" | "send" | "promote",
	value: number,
	msg: string,
	balance: number,
}

export interface ScannerData
{
	code: string,
}

const url = "/api/scanner"

export const useMutationScanner = stdMutation<ScannerData, ScannerRes>(url, (qc, data) =>
{
	qc.setQueryData<User>(queryKeyUser(), user =>
		user ? { ...user, balance: data.balance } : undefined
	);
	if (data.res == "ok" && data.action == "promote")
		queryInvalidate(qc, queryKeyUser());
	if (data.res == "ok" && data.action == "quest")
		queryInvalidate(qc, queryKeyQuest());
});
