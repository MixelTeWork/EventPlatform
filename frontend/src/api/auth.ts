import { useMutation, useQueryClient } from "react-query";
import { fetchJsonPost, fetchPost } from "../utils/fetch"
import { ApiError } from "./dataTypes";
import { User, createEmptyUser } from "./user";

export function useMutationAuth(onError?: (msg: string) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: postAuth,
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

async function postAuth(authData: AuthData)
{
	const user = await fetchJsonPost<User>("/api/auth", authData);
	user.auth = true;
	return user;
}

interface AuthData
{
	login: string,
	password: string,
}


export function useMutationLogout(onSuccess?: () => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: postLogout,
		onSuccess: () =>
		{
			queryClient.setQueryData("user", (_?: User) => createEmptyUser());
			onSuccess?.();
		}
	});
	return mutation;
}

export async function postLogout()
{
	await fetchPost("/api/logout");
}
