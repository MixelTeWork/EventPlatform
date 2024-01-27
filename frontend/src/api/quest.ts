import { useMutation, useQuery } from "react-query";
import { fetchJsonGet, fetchJsonPost } from "../utils/fetch";

export interface Quest
{
	id: number;
	name: string;
	reward: number;
	completed: boolean,
}


export default function useQuests()
{
	return useQuery("quests", async () =>
		await fetchJsonGet<Quest[]>("/api/quests")
	);
}

export function useMutationCompleteQuest(onSuccess?: (data: CompleteQuestRes) => void, onError?: (err: any) => void)
{
	const mutation = useMutation({
		mutationFn: async (completeQuestData: CompleteQuestData) =>
			await fetchJsonPost<CompleteQuestRes>("/api/quest_complete", completeQuestData),
		onSuccess: onSuccess,
		onError: onError,
	});
	return mutation;
}

export interface CompleteQuestData
{
	questId: number,
	userId: number,
}

export interface CompleteQuestRes
{
	res: "ok" | "already_done" | "no_player",
	player: string,
}
