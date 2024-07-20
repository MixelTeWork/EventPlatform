import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchDelete, fetchJsonGet, fetchJsonPost } from "../utils/fetch";
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
}
export type GameDialogCharacterData = { [id: number]: GameDialogCharacter; };

export function createEmptyDialog(): GameDialogData
{
	return {
		nodes: [],
	}
}
export function createEmptyDialogNode(): GameDialogNode
{
	return {
		characterId: 1,
		text: "",
	}
}

export function createEmptyCharacter(id: number): GameDialogCharacter
{
	return {
		id,
		name: "",
		img: "",
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
		const characters = {} as GameDialogCharacterData;
		data.forEach(v => characters[v.id] = v);
		return characters;
	});
}


export function useMutationAddCharacter(onSuccess?: (data: GameDialogCharacter) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (characterData: CharacterData) =>
			await fetchJsonPost<GameDialogCharacter>("/api/dialog/character", characterData),
		onSuccess: (data: GameDialogCharacter) =>
		{
			if (queryClient.getQueryState("dialogCharacters")?.status == "success")
				queryClient.setQueryData("dialogCharacters", (characters?: GameDialogCharacterData) =>
				{
					characters = characters || {};
					characters[data.id] = data;
					return characters;
				});

			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export interface CharacterData
{
	name: string;
	img?: ImgData;
}

export function useMutationEditCharacter(characterId: number, onSuccess?: (data: GameDialogCharacter) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (characterData: CharacterData) =>
			await fetchJsonPost<GameDialogCharacter>(`/api/dialog/character/${characterId}`, characterData),
		onSuccess: (data: GameDialogCharacter) =>
		{
			if (queryClient.getQueryState("dialogCharacters")?.status == "success")
				queryClient.setQueryData("dialogCharacters", (characters?: GameDialogCharacterData) =>
				{
					characters = characters || {};
					characters[data.id] = data;
					return characters;
				});

			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export function useMutationDeleteCharacter(characterId: number, onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchDelete(`/api/dialog/character/${characterId}`),
		onSuccess: () =>
		{
			if (queryClient.getQueryState("dialogCharacters")?.status == "success")
				queryClient.setQueryData("dialogCharacters", (characters?: GameDialogCharacterData) =>
				{
					characters = characters || {};
					delete characters[characterId];
					return characters;
				});

			onSuccess?.();
		},
		onError: onError,
	});
	return mutation;
}
