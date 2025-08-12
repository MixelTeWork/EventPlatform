import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, ResponseMsg } from "./dataTypes";
import { queryInvalidate, queryListAddItem, queryListUpdateItem, stdQuery } from "@/utils/query";
import { itemMutation, stdMutation, stdMutationNoRes } from "@/utils/mutations";
import { fetchJsonPost } from "@/utils/fetch";
import { queryKey as queryKeyQuest } from "./quest"

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
	ticketTId: number;
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
	roles: UserRole[];
	deleted: boolean;
	operations: string[];
	group: UserGroup;
	gameOpened: boolean;
	ticketTId: number;
}

export type UserGroup = -1 | 0 | 1 | 2;
export interface UserRole { id: number, name: string }

export interface UserWithPwd extends User
{
	password: string;
}

const url = "/api/user"
const urlList = "/api/users"
const queryKey = () => ["user"];
const queryKeyList = () => ["users"];
const queryKeyRoles = () => ["users", "roles"];

export const createEmptyUser: (() => User) = () =>
	({ auth: false, id: "", balance: 0, roles: [], name: "", last_name: "", photo: "", operations: [], group: -1, gameOpened: false, ticketTId: -1 });


export function useUpdateUser()
{
	const queryClient = useQueryClient();
	return () => queryInvalidate(queryClient, queryKey());
}

export function useUser()
{
	return useQuery({
		queryKey: queryKey(),
		queryFn: async () =>
		{
			const res = await fetch(url);
			const data = await res.json();

			if (res.status == 401) return createEmptyUser();
			if (!res.ok) throw new ApiError((data as ResponseMsg).msg);

			const user = data as User;
			user.auth = true;
			return user;
		},
	});
}

export const useUsers = stdQuery<UserFull[]>(queryKeyList(), urlList);

interface ChangePasswordData { password: string; }
export const useMutationChangePassword = stdMutationNoRes<ChangePasswordData>(`${url}/change_password`);

interface ChangeName { name: string; }
export const useMutationChangeName = stdMutationNoRes<ChangeName>(`${url}/change_name`, (qc, data) =>
{
	qc.setQueryData(queryKey(), (user?: User) => (user ? { ...user, name: data.name } : undefined));
});

interface SetGroup { group: UserGroup; }
export const useMutationSetGroup = stdMutation<SetGroup, SetGroup>(`${url}/set_group`, (qc, data) =>
{
	qc.setQueryData(queryKey(), (user?: User) => (user ? { ...user, group: data.group } : undefined));
	queryInvalidate(qc, queryKeyQuest());
});

export const useMutationOpenGame = stdMutationNoRes<void>(`${url}/open_game`, qc =>
{
	qc.setQueryData(queryKey(), (user?: User) => (user ? { ...user, gameOpened: true } : undefined));
});


interface AuthData { login: string, password: string }
export const useMutationAuth = authMutation<AuthData>("/api/auth")

interface AuthByTicketData { code: string }
export const useMutationAuthByTicket = authMutation<AuthByTicketData>("/api/auth_ticket")

export const useMutationLogout = stdMutationNoRes<void>("/api/logout", qc =>
{
	qc.setQueryData(queryKey(), (_?: User) => createEmptyUser());
});

function authMutation<TAuthData>(url: string)
{
	return (onError?: (msg: string) => void) =>
	{
		const queryClient = useQueryClient();
		const mutation = useMutation({
			mutationFn: async (authData: TAuthData) =>
			{
				const user = await fetchJsonPost<User>(url, authData);
				user.auth = true;
				return user;
			},
			onSuccess: (data) =>
			{
				queryClient.setQueryData(queryKey(), data);
			},
			onError: (error) =>
			{
				onError?.(error instanceof ApiError ? error.message : "Произошла ошибка, попробуйте ещё раз");
			}
		});
		return mutation;
	}
}

export const useUsersRoles = stdQuery<UserRole[]>(queryKeyRoles(), urlList + "/roles");

interface NewUserData { login: string; password: string; name: string; roles: number[]; }
export const useMutationUserAdd = stdMutation<NewUserData, UserFull>(urlList, (qc, data) => queryListAddItem(qc, queryKeyList(), data));
export const useMutationUserSetRoles = itemMutation<number[], UserFull>(id => `${urlList}/${id}/roles`,
	(qc, data) => queryListUpdateItem(qc, queryKeyList(), data),
	roles => ({ roles })
);
export const useMutationUserSetPassword = itemMutation<string, UserFull>(id => `${urlList}/${id}/set_password`,
	(qc, data) => queryListUpdateItem(qc, queryKeyList(), data),
	password => ({ password })
);
export const useMutationUserSetName = itemMutation<string, UserFull>(id => `${urlList}/${id}/set_name`,
	(qc, data) => queryListUpdateItem(qc, queryKeyList(), data),
	name => ({ name })
);