import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchDelete, fetchJsonGet, fetchJsonPost } from "../utils/fetch";
import type { ImgData } from "./dataTypes";
import { queryListAddItem, queryListDeleteItem, queryListUpdateItem } from "../utils/query";


export interface TourneyData
{
	tree: TreeNode,
}

export interface TreeNode
{
	characterId: number,
	left: TreeNode | null,
	right: TreeNode | null,
}

export function useTourneyCharacters()
{
	return useQuery("tourneyCharacters", async () =>
		await fetchJsonGet<TourneyCharacter[]>(`/api/tourney/characters`)
	);
}

export interface TourneyCharacter
{
	id: number,
	name: string,
	img: string,
}

export function useMutationAddTourneyCharacter(onSuccess?: (data: TourneyCharacter) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (characterData: TourneyCharacterData) =>
			await fetchJsonPost<TourneyCharacter>("/api/tourney/characters", characterData),
		onSuccess: (data: TourneyCharacter) =>
		{
			queryListAddItem(queryClient, "tourneyCharacters", data);
			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export interface TourneyCharacterData
{
	name: string,
	img?: ImgData,
}

export function useMutationEditTourneyCharacter(characterId: number, onSuccess?: (data: TourneyCharacter) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (characterData: TourneyCharacterData) =>
			await fetchJsonPost<TourneyCharacter>(`/api/tourney/characters/${characterId}`, characterData),
		onSuccess: (data: TourneyCharacter) =>
		{
			queryListUpdateItem(queryClient, "tourneyCharacters", data);
			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export function useMutationDeleteTourneyCharacter(characterId: number, onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchDelete(`/api/tourney/characters/${characterId}`),
		onSuccess: () =>
		{
			queryListDeleteItem(queryClient, "tourneyCharacters", characterId);
			onSuccess?.();
		},
		onError: onError,
	});
	return mutation;
}
