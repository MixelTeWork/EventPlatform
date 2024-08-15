import { useMutation, useQuery, useQueryClient } from "react-query";
import { ApiError, ResponseMsg } from "./dataTypes";
import { fetchJsonGet, fetchJsonPost, fetchPost } from "../utils/fetch";

export interface User
{
	auth: boolean;
	id: string;
	name: string;
	last_name: string;
	photo: string;
	balance: number;
	roles: string[];
	operations: string[];
	group: UserGroup;
	gameOpened: boolean;
}

export interface UserFull
{
	id: number;
	id_vk: number;
	id_big: string;
	login: string;
	name: string;
	last_name: string;
	photo: string;
	balance: number;
	roles: string[];
	deleted: boolean;
	operations: string[];
	group: UserGroup;
	gameOpened: boolean;
}

export type UserGroup = -1 | 0 | 1 | 2;

export interface UserWithPwd extends User
{
	password: string;
}

export function createEmptyUser(): User
{
	return { auth: false, id: "", balance: 0, roles: [], name: "", last_name: "", photo: "", operations: [], group: -1, gameOpened: false };
}

export function useUpdateUser()
{
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries("user");
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

export function useMutationSetGroup(onSuccess?: () => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (data: SetGroup) =>
			await fetchJsonPost<SetGroup>("/api/user/set_group", data),
		onSuccess: (data: SetGroup) =>
		{
			if (queryClient.getQueryState("user")?.status == "success")
				queryClient.setQueryData("user", (user?: User) => ({ ...user!, group: data.group }));

			queryClient.invalidateQueries("quests", { exact: true });

			onSuccess?.();
		},
	});
	return mutation;
}

interface SetGroup
{
	group: UserGroup;
}

export function useMutationOpenGame(onSuccess?: () => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchPost("/api/user/open_game"),
		onSuccess: () =>
		{
			if (queryClient.getQueryState("user")?.status == "success")
				queryClient.setQueryData("user", (user?: User) => ({ ...user!, gameOpened: true }));

			onSuccess?.();
		},
	});
	return mutation;
}
