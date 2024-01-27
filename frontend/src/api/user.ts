import { useMutation, useQuery, useQueryClient } from "react-query";
import { ApiError, ResponseMsg } from "./dataTypes";
import { fetchJsonGet, fetchPost } from "../utils/fetch";

export interface User
{
	auth: boolean;
	id: number;
	balance: number;
	name: string;
	login: string;
	roles: string[];
	operations: string[];
}

export interface UserFull
{
	id: number;
	name: string;
	login: string;
	roles: string[];
	bossId: number | null;
	deleted: boolean;
	access: string[];
	operations: string[];
}

export interface UserWithPwd extends User
{
	password: string;
}

export function createEmptyUser(): User
{
	return { auth: false, id: -1, balance: 0, login: "", roles: [], name: "", operations: [] };
}

export default function useUser()
{
	return useQuery("user", getUser);
}

async function getUser(): Promise<User>
{
	const res = await fetch("/api/user");
	const data = await res.json();

	if (res.status == 401) return createEmptyUser();
	if (!res.ok) throw new ApiError((data as ResponseMsg).msg);

	const user = data as User;
	user.auth = true;
	return user;
}

export function useUsers()
{
	return useQuery("users", async () =>
		await fetchJsonGet<UserFull[]>("/api/users")
	);
}

export function useMutationChangePassword(onSuccess?: () => void)
{
	const mutation = useMutation({
		mutationFn: async (data: ChangePasswordData) =>
			await fetchPost("/api/user/change_password", data),
		onSuccess: onSuccess,
	});
	return mutation;
}


interface ChangePasswordData
{
	password: string;
}

export function useMutationChangeName(onSuccess?: () => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (data: ChangeName) =>
		{
			await fetchPost("/api/user/change_name", data);
			return data;
		},
		onSuccess: (data: ChangeName) =>
		{
			if (queryClient.getQueryState("user")?.status == "success")
				queryClient.setQueryData("user", (user?: User) => ({ ...user!, name: data.name }));
			onSuccess?.();
		},
	});
	return mutation;
}

interface ChangeName
{
	name: string;
}