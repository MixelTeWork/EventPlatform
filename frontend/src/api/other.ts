import { useQuery, useQueryClient } from "react-query";
import { fetchJsonGet } from "../utils/fetch";

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