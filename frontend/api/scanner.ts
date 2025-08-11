import { queryInvalidate } from "@/utils/query";
import { stdMutation } from "@/utils/mutations";
// import { createEmptyUser, type User } from "./user";

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
	// qc.setQueryData<User>("user", user =>
	// {
	// 	user = user || createEmptyUser();
	// 	user.balance = data.balance;
	// 	if (data.res == "ok" && data.action == "promote")
	// 		queryInvalidate(qc, "user");
	// 	if (data.res == "ok" && data.action == "quest")
	// 		queryInvalidate(qc, "quests");
	// 	return user;
	// });
})
