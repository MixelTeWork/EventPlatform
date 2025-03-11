import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchDelete, fetchJsonGet, fetchJsonPost } from "../utils/fetch";
import type { ImgData } from "./dataTypes";
import { queryListAddItem, queryListDeleteItem, queryListUpdateItem } from "../utils/query";


export interface TourneyData
{
	tree: TreeNode,
	third: number,
	curGameNodeId: number,
	showGame: boolean,
	ended: boolean,
}

export interface TreeNode
{
	id: number,
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

export function characterById(characters: TourneyCharacter[] | undefined | null, id: number | undefined | null)
{
	return characters?.find(ch => ch.id == id);
}


export function useTourneyData()
{
	return useQuery("tourney", async () =>
		await fetchJsonGet<TourneyData>(`/api/tourney`)
	);
}

export interface TourneyCharacter
{
	id: number,
	name: string,
	color: string,
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
	color: string,
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


export function useMutationTourneyEditNode(nodeId: number, onSuccess?: () => void, onError?: (err: any) => void)
{
	return useMutationAction((nodeData: TourneyNodeData) => [`/api/tourney/nodes/${nodeId}`, nodeData], onSuccess, onError);
}

export interface TourneyNodeData
{
	characterId: number,
}

export function useMutationTourneyEditThird(onSuccess?: () => void, onError?: (err: any) => void)
{
	return useMutationAction((nodeData: TourneyNodeData) => [`/api/tourney/third`, nodeData], onSuccess, onError);
}

export function useMutationTourneyStartGameAtNode(nodeId: number, onSuccess?: () => void, onError?: (err: any) => void)
{
	return useMutationAction(() => [`/api/tourney/start_game_at_node`, { nodeId }], onSuccess, onError);
}

export function useMutationTourneySelectNextGame(onSuccess?: () => void, onError?: (err: any) => void)
{
	return useMutationAction(() => `/api/tourney/select_next_game`, onSuccess, onError);
}

export function useMutationTourneyStartGame(onSuccess?: () => void, onError?: (err: any) => void)
{
	return useMutationAction(() => `/api/tourney/start_game`, onSuccess, onError);
}

export function useMutationTourneyEndGame(onSuccess?: () => void, onError?: (err: any) => void)
{
	return useMutationAction(() => `/api/tourney/end_game`, onSuccess, onError);
}

export function useMutationTourneyEndTourney(onSuccess?: () => void, onError?: (err: any) => void)
{
	return useMutationAction(() => `/api/tourney/end_tourney`, onSuccess, onError);
}

export function useMutationTourneyUnendTourney(onSuccess?: () => void, onError?: (err: any) => void)
{
	return useMutationAction(() => `/api/tourney/unend_tourney`, onSuccess, onError);
}

export function useMutationTourneyReset(onSuccess?: () => void, onError?: (err: any) => void)
{
	return useMutationAction(() => `/api/tourney/reset`, onSuccess, onError);
}


function useMutationAction<T = void>(mutationFn: (v: T) => string | [string, any], onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (v: T) =>
		{
			const params = mutationFn(v);
			const newLocal = typeof params == "string" ? [params, undefined] as [string, undefined] : params;
			return await fetchJsonPost<TourneyData>(...newLocal);
		},
		onSuccess: (data: TourneyData) =>
		{
			queryClient.setQueryData("tourney", data);
			onSuccess?.();
		},
		onError: onError,
	});
	return mutation;
}
