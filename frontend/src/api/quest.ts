import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchDelete, fetchJsonGet, fetchJsonPost, fetchPost } from "../utils/fetch";
import type { GameDialogData } from "./dialog";
import { queryInvalidate, queryListAddItem, queryListDeleteItem, queryListUpdateItem } from "../utils/query";

export interface Quest
{
	id: number,
	name: string,
	description: string,
	reward: number,
	completed: boolean,
	dialogId: number | null,
	opened: boolean,
}

export interface QuestFull
{
	id: number,
	id_big: string,
	name: string,
	description: string,
	reward: number,
	hidden: boolean,
	dialog1Id: number | null,
	dialog2Id: number | null,
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


export function useMutationAddQuest(onSuccess?: (data: QuestFull) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (questData: QuestData) =>
			await fetchJsonPost<QuestFull>("/api/quest", questData),
		onSuccess: (data: QuestFull) =>
		{
			queryListAddItem(queryClient, "quests_full", data);
			queryInvalidate(queryClient, "quests");
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
	dialog1?: GameDialogData | false,
	dialog2?: GameDialogData | false,
}

export function useMutationEditQuest(questId: number, onSuccess?: (data: QuestFull) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (questData: QuestData) =>
			await fetchJsonPost<QuestFull>(`/api/quest/${questId}`, questData),
		onSuccess: (data: QuestFull) =>
		{
			queryListUpdateItem(queryClient, "quests_full", data);
			queryInvalidate(queryClient, "quests");
			queryInvalidate(queryClient, ["dialogs", data.dialog1Id]);
			queryInvalidate(queryClient, ["dialogs", data.dialog2Id]);
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
			queryListDeleteItem(queryClient, "quests_full", questId);
			queryInvalidate(queryClient, "quests");
			onSuccess?.();
		},
		onError: onError,
	});
	return mutation;
}


export function useMutationOpenQuest(onSuccess?: () => void, onError?: (err: any) => void)
{
	const mutation = useMutation({
		mutationFn: async (questId: number) =>
			await fetchPost(`/api/quest/${questId}/open`),
		onSuccess,
		onError,
	});
	return mutation;
}
