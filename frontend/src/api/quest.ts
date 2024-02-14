import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchDelete, fetchJsonGet, fetchJsonPost } from "../utils/fetch";

export interface Quest
{
	id: number;
	name: string;
	description: string;
	reward: number;
}

export function useQuests()
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
	userId: string,
}

export interface CompleteQuestRes
{
	res: "ok" | "already_done" | "no_visitor",
	visitor: string,
}


export function useMutationAddQuest(onSuccess?: (data: Quest) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (questData: QuestData) =>
			await fetchJsonPost<Quest>("/api/quest", questData),
		onSuccess: (data: Quest) =>
		{
			if (queryClient.getQueryState("quests")?.status == "success")
				queryClient.setQueryData("quests", (quests?: Quest[]) => quests ? [...quests, data] : [data]);

			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export interface QuestData
{
	name: string,
	reward: number,
}

export function useMutationEditQuest(questId: number, onSuccess?: (data: Quest) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (questData: QuestData) =>
			await fetchJsonPost<Quest>(`/api/quest/${questId}`, questData),
		onSuccess: (data: Quest) =>
		{
			if (queryClient.getQueryState("quests")?.status == "success")
				queryClient.setQueryData("quests", (quests?: Quest[]) => quests?.map(v => v.id == data.id ? data : v) || []);

			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export function useMutationDeleteQuest(questId: number, onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchDelete(`/api/quest/${questId}`),
		onSuccess: () =>
		{
			if (queryClient.getQueryState("quests")?.status == "success")
				queryClient.setQueryData("quests", (quests?: Quest[]) => quests?.filter(v => v.id != questId) || []);

			onSuccess?.();
		},
		onError: onError,
	});
	return mutation;
}
