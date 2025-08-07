import { useQuery, type QueryClient } from "@tanstack/react-query";
import { itemDeleteMutation, itemMutation, stdMutation } from "@/utils/mutations";
import { fetchJsonGet } from "@/utils/fetch";
import { itemQuery } from "@/utils/query";
import type { ImgData } from "./dataTypes";

export interface Dialog
{
	id: number;
	data: GameDialogData;
}
export interface GameDialogData
{
	nodes: GameDialogNode[];
}
export interface GameDialogNode
{
	characterId: number;
	text: string;
}

export interface GameDialogCharacter
{
	id: number;
	name: string;
	img: string;
	orien: number;
}
export type GameDialogCharacterData = { [id: number]: GameDialogCharacter; };

export const createEmptyDialog: (() => GameDialogData) = () =>
	({ nodes: [] });
export const createEmptyDialogNode: (() => GameDialogNode) = () =>
	({ characterId: 1, text: "" });
export const createEmptyCharacter: ((id: number) => GameDialogCharacter) = (id: number) =>
	({ id, name: "", img: "", orien: 1 });


const url = (id: number) => `/api/dialog/${id}`;
const urlCharacters = "/api/dialog/characters";
export const queryKey = (id: number) => ["dialogs", `${id}`];
const queryKeyCharacters = () => ["dialogCharacters"];

export const useDialog = itemQuery<Dialog>(queryKey, url);

export interface DialogData { data: GameDialogData; }
export const useMutationDialogEdit = itemMutation<DialogData, Dialog>(url, (qc, data) =>
{
	qc.setQueryData(queryKey(data.id), data);
});


export const useDialogCharacters = () => useQuery({
	queryKey: queryKeyCharacters(),
	queryFn: async () =>
	{
		const data = await fetchJsonGet<GameDialogCharacter[]>(urlCharacters);
		const characters = {} as GameDialogCharacterData;
		data.forEach(v => characters[v.id] = v);
		return characters;
	}
});

export interface CharacterData
{
	name: string;
	img?: ImgData;
	orien: number;
}
export const useMutationCharacterAdd = stdMutation<CharacterData, GameDialogCharacter>(urlCharacters, updateData((characters, data) =>
{
	characters[data.id] = data;
}));

export const useMutationCharacterEdit = itemMutation<CharacterData, GameDialogCharacter>(urlCharacters, updateData((characters, data) =>
{
	characters[data.id] = data;
}));

export const useMutationCharacterDelete = itemDeleteMutation(urlCharacters, updateData((characters, id) =>
{
	delete characters[id];
}));

function updateData<T>(updater: (characters: GameDialogCharacterData, data: T) => void)
{
	return (qc: QueryClient, data: T) =>
		qc.setQueryData(queryKeyCharacters(), (characters?: GameDialogCharacterData) =>
		{
			if (!characters) return undefined;
			updater(characters, data);
			return characters;
		});
}
