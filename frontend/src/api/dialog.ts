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
	characterId: number;
	text: string;
}

export interface GameDialogCharacter
{
	id: number;
	name: string;
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

export function useDialogCharacters()
{
	return useQuery(["dialogCharacters"], async () =>
	{
		const data = await fetchJsonGet<GameDialogCharacter[]>(`/api/dialog/characters`);
		const characters = {} as { [id: number]: GameDialogCharacter };
		data.forEach(v => characters[v.id] = v);
		return characters;
	});
}
