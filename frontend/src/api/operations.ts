import { UseQueryResult } from "react-query";
import { User } from "./user";
import useUser from "./user";

const Operations = {
	page_debug: "page_debug",
	page_users: "page_users",
	page_staff: "page_staff",
	page_staff_quest: "page_staff_quest",
	page_staff_store: "page_staff_store",
	page_stats: "page_stats",
	site_config: "site_config",
	promote_staff: "promote_staff",
	promote_manager: "promote_manager",
	manage_store: "manage_store",
	manage_quest: "manage_quest",
	manage_games: "manage_games",
	send_any: "send_any",
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
