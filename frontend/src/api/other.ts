import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchJsonGet, fetchJsonPost } from "../utils/fetch";

interface Stats
{
	group1_members: number,
	group1_completed: number,
	group2_members: number,
	group2_completed: number,
}

export function useStats()
{
	return useQuery("stats", async () =>
		await fetchJsonGet<Stats>("/api/other/stats")
	);
}

export function useStatsCacheClear()
{
	const queryClient = useQueryClient();
	return () =>
	{
		queryClient.removeQueries("stats");
	}
}

export function useTicketLoginEnabled()
{
	return useQuery("ticketLoginEnabled", async () =>
		await fetchJsonGet<{value: boolean}>("/api/other/ticketLoginEnabled")
	);
}

export function useMutationTicketLoginEnabled(onSuccess?: (data: {value: boolean}) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (value: boolean) =>
			await fetchJsonPost<{value: boolean}>("/api/other/ticketLoginEnabled", { value }),
		onSuccess: (data) =>
		{
			queryClient.setQueryData("ticketLoginEnabled", data);
			onSuccess?.(data);
		},
		onError,
	});
	return mutation;
}
