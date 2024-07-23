import { useMutation, useQueryClient } from "react-query";
import { fetchJsonPost, fetchPost } from "../utils/fetch"
import { ApiError } from "./dataTypes";
import { User, createEmptyUser } from "./user";

export function useMutationAuth(onError?: (msg: string) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (authData: AuthData) =>
		{
			const user = await fetchJsonPost<User>("/api/auth", authData);
			user.auth = true;
			return user;
		},
		onSuccess: (data) =>
		{
			queryClient.setQueryData("user", data);
		},
		onError: (error) =>
		{
			onError?.(error instanceof ApiError ? error.message : "Произошла ошибка, попробуйте ещё раз");
		}
	});
	return mutation;
}

interface AuthData
{
	login: string,
	password: string,
}


export function useMutationAuthByTicket(onError?: (msg: string) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (data: AuthByTicketData) =>
		{
			const user = await fetchJsonPost<User>("/api/auth_ticket", data);
			user.auth = true;
			return user;
		},
		onSuccess: (data) =>
		{
			queryClient.setQueryData("user", data);
		},
		onError: (error) =>
		{
			onError?.(error instanceof ApiError ? error.message : "Произошла ошибка, попробуйте ещё раз");
		}
	});
	return mutation;
}

interface AuthByTicketData
{
	code: string,
}


export function useMutationLogout(onSuccess?: () => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchPost("/api/logout"),
		onSuccess: () =>
		{
			queryClient.setQueryData("user", (_?: User) => createEmptyUser());
			onSuccess?.();
		}
	});
	return mutation;
}
