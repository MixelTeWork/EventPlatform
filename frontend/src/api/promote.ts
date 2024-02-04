import { useMutation } from "react-query";
import { fetchJsonPost } from "../utils/fetch";

export function useMutationPromoteWorker(onSuccess?: (res: PromoteRes) => void, onError?: (err: any) => void)
{
	const mutation = useMutation({
		mutationFn: async (promoteData: PromoteData) =>
			await fetchJsonPost<PromoteRes>("/api/promote_worker", promoteData),
		onSuccess: onSuccess,
		onError: onError,
	});
	return mutation;
}

export function useMutationPromoteManager(onSuccess?: (res: PromoteRes) => void, onError?: (err: any) => void)
{
	const mutation = useMutation({
		mutationFn: async (promoteData: PromoteData) =>
			await fetchJsonPost<PromoteRes>("/api/promote_manager", promoteData),
		onSuccess: onSuccess,
		onError: onError,
	});
	return mutation;
}

export interface PromoteData
{
	userId: string,
}

export interface PromoteRes
{
	res: "ok" | "no_user" | "already_has",
	user: string,
}
