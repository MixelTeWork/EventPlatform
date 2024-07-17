import { useQuery } from "react-query";
import { fetchJsonGet } from "../utils/fetch";

interface Dialog
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

export function useDialog(dialogId: number)
{
	return useQuery(["dialogs", `${dialogId}`], async () =>
		await fetchJsonGet<Dialog>(`/api/dialog/${dialogId}`),
		{ enabled: dialogId >= 0 }
	);
}
