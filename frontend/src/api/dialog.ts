import { useQuery } from "react-query";
import { fetchJsonGet } from "../utils/fetch";

export interface Dialog
{
	id: number;
	data: GameDialogData;
}

export interface GameDialogData
{
	nodes: GameDialogNode[];
}

interface GameDialogNode
{
	title: string;
	text: string;
	img: string;
}

export function createEmptyDialog(): GameDialogData
{
	return {
		nodes: [],
	}
}

export function useDialog(dialogId: number, autoEnabled = true)
{
	return useQuery(["dialogs", `${dialogId}`], async () =>
		await fetchJsonGet<Dialog>(`/api/dialog/${dialogId}`),
		{ enabled: autoEnabled && dialogId >= 0 }
	);
}
