import { UseQueryResult } from "react-query";
import { User } from "./dataTypes";
import useUser from "./user";

const Operations = {
	page_debug: "page_debug",
	page_users: "page_users",
	page_worker: "page_worker",
	page_scanner_quest: "page_scanner_quest",
	page_scanner_store: "page_scanner_store",
}

export type Operation = keyof typeof Operations;

export default function hasPermission(user: UseQueryResult<User, unknown>, operation: Operation)
{
	return !!(user.data?.auth && user.data?.operations.includes(operation));
}

export function useHasPermission(operation: Operation)
{
	const user = useUser();
	return hasPermission(user, operation);
}
