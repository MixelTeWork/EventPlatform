import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchDelete, fetchJsonGet, fetchJsonPost } from "../utils/fetch";

export interface Quest
{
	id: number,
	name: string,
	description: string,
	reward: number,
	completed: boolean,
}

export interface QuestFull
{
	id: number,
	id_big: string,
	name: string,
	description: string,
	reward: number,
	hidden: boolean,
}

export function useQuests()
{
	return useQuery("quests", async () =>
		await fetchJsonGet<Quest[]>("/api/quests")
	);
}

export function useQuestsFull()
{
	return useQuery("quests_full", async () =>
		await fetchJsonGet<QuestFull[]>("/api/quests_full")
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


export function useMutationAddQuest(onSuccess?: (data: QuestFull) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (questData: QuestData) =>
			await fetchJsonPost<QuestFull>("/api/quest", questData),
		onSuccess: (data: QuestFull) =>
		{
			if (queryClient.getQueryState("quests_full")?.status == "success")
				queryClient.setQueryData("quests_full", (quests?: QuestFull[]) => quests ? [...quests, data] : [data]);

			if (queryClient.getQueryState("quests")?.status == "success")
			{
				console.log("some log for testing");
				queryClient.invalidateQueries("quests", { exact: true });
			}

			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export interface QuestData
{
	name: string,
	description: string,
	reward: number,
	hidden: boolean,
}

export function useMutationEditQuest(questId: number, onSuccess?: (data: QuestFull) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (questData: QuestData) =>
			await fetchJsonPost<QuestFull>(`/api/quest/${questId}`, questData),
		onSuccess: (data: QuestFull) =>
		{
			if (queryClient.getQueryState("quests_full")?.status == "success")
				queryClient.setQueryData("quests_full", (quests?: QuestFull[]) => quests?.map(v => v.id == data.id ? data : v) || []);

			if (queryClient.getQueryState("quests")?.status == "success")
				queryClient.invalidateQueries("quests", { exact: true });

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
			if (queryClient.getQueryState("quests_full")?.status == "success")
				queryClient.setQueryData("quests_full", (quests?: QuestFull[]) => quests?.filter(v => v.id != questId) || []);

			if (queryClient.getQueryState("quests")?.status == "success")
				queryClient.invalidateQueries("quests", { exact: true });

			onSuccess?.();
		},
		onError: onError,
	});
	return mutation;
}
