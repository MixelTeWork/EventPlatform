import { queryInvalidate, queryListAddItem, queryListDeleteItem, queryListUpdateItem, useStdQuery } from "@/utils/query";
import { itemDeleteMutation, itemMutation, stdMutation, stdMutationNoRes } from "@/utils/mutations";
// import type { GameDialogData } from "./dialog";

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

const url = "/api/quests"
const urlFull = "/api/quests_full"
const queryKey = () => ["quests"];
const queryKeyFull = () => ["quests_full"];

export const useQuests = useStdQuery<Quest[]>(queryKey(), url);
export const useQuestsFull = useStdQuery<QuestFull[]>(queryKeyFull(), urlFull);

export interface QuestData
{
	name: string,
	description: string,
	reward: number,
	hidden: boolean,
	// dialog1?: GameDialogData | false,
	// dialog2?: GameDialogData | false,
}

export const useMutationAddQuest = stdMutation<QuestData, QuestFull>(url, (qc, data) =>
{
	queryListAddItem(qc, queryKeyFull(), data);
	queryInvalidate(qc, queryKey());
});

export const useMutationEditQuest = itemMutation<QuestData, QuestFull>(url, (qc, data) =>
{
	queryListUpdateItem(qc, queryKeyFull(), data);
	queryInvalidate(qc, queryKey());
	// queryInvalidate(qc, ["dialogs", data.dialog1Id]);
	// queryInvalidate(qc, ["dialogs", data.dialog2Id]);
});

export const useMutationDeleteQuest = itemDeleteMutation(url, (qc, id) =>
{
	queryListDeleteItem(qc, queryKeyFull(), id);
	queryInvalidate(qc, queryKey());
});

export const useMutationOpenQuest = stdMutationNoRes<number>(id => `${url}/${id}/open`);
