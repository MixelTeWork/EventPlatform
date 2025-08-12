"use client"
import { useUsers, useUsersRoles } from "@/api/user";
import displayError from "@/utils/displayError";
import { useTitle } from "@/utils/useTtile";
import AddUser from "./AddUser";
import User from "./User";

export default function UsersPage()
{
	useTitle("Users");
	const roles = useUsersRoles()
	const users = useUsers()

	return (
		<>
			{users.isLoading && <h3>Загрузка</h3>}
			{displayError(users)}
			{roles.isLoading && <h3>Загрузка</h3>}
			{displayError(roles)}
			<AddUser />
			{users.data?.map(v => <User data={v} key={v.id} />)}
		</>
	);
}
