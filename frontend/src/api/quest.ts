import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchDelete, fetchJsonGet, fetchJsonPost, fetchPost } from "../utils/fetch";
import type { GameDialogData } from "./dialog";

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
			if (queryClient.getQueryState("quests_full")?.status == "success")
				queryClient.setQueryData("quests_full", (quests?: QuestFull[]) => quests ? [...quests, data] : [data]);

			queryClient.invalidateQueries("quests", { exact: true });

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
			if (queryClient.getQueryState("quests_full")?.status == "success")
				queryClient.setQueryData("quests_full", (quests?: QuestFull[]) => quests?.map(v => v.id == data.id ? data : v) || []);

			queryClient.invalidateQueries("quests", { exact: true });
			queryClient.invalidateQueries(["dialogs", `${data.dialog1Id}`], { exact: true });
			queryClient.invalidateQueries(["dialogs", `${data.dialog2Id}`], { exact: true });

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

			queryClient.invalidateQueries("quests", { exact: true });

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
