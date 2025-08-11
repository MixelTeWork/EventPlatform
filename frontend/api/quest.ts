import { queryInvalidate, queryListAddItem, queryListDeleteItem, queryListUpdateItem, stdQuery } from "@/utils/query";
import { itemDeleteMutation, itemMutation, stdMutation, stdMutationNoRes } from "@/utils/mutations";
import type { GameDialogData } from "./dialog";
import { queryKey as queryKeyDialog } from "./dialog"

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
export const queryKey = () => ["quests"];
const queryKeyFull = () => ["quests_full"];

export const useQuests = stdQuery<Quest[]>(queryKey(), url);
export const useQuestsFull = stdQuery<QuestFull[]>(queryKeyFull(), urlFull);

export interface QuestData
{
	name: string,
	description: string,
	reward: number,
	hidden: boolean,
	dialog1?: GameDialogData | false,
	dialog2?: GameDialogData | false,
}

export const useMutationQuestAdd = stdMutation<QuestData, QuestFull>(url, (qc, data) =>
{
	queryListAddItem(qc, queryKeyFull(), data);
	queryInvalidate(qc, queryKey());
});

export const useMutationQuestEdit = itemMutation<QuestData, QuestFull>(url, (qc, data) =>
{
	queryListUpdateItem(qc, queryKeyFull(), data);
	queryInvalidate(qc, queryKey());
	if (data.dialog1Id != null) qc.removeQueries({ queryKey: queryKeyDialog(data.dialog1Id), exact: true });
	if (data.dialog2Id != null) qc.removeQueries({ queryKey: queryKeyDialog(data.dialog2Id), exact: true });
});

export const useMutationQuestDelete = itemDeleteMutation(url, (qc, id) =>
{
	queryListDeleteItem(qc, queryKeyFull(), id);
	queryInvalidate(qc, queryKey());
});

export const useMutationQuestOpen = stdMutationNoRes<number>(id => `${url}/${id}/open`);
